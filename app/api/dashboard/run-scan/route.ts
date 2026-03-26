export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { isVIPCode } from '@/lib/vip-codes';
import { validateSubscriptionId, consumeCredit, updateSubscription } from '@/lib/subscriptions';
import type { ProductType } from '@/lib/subscriptions';
import { saveReport } from '@/lib/reports';
import type { ReportRecord, ReportSeverity } from '@/lib/reports';
import { recordUsageEvent } from '@/lib/analytics';
import type { UsageEvent } from '@/lib/analytics';
import redis from '@/lib/redis';

// Internal/founder/admin codes that bypass credit deduction
function isUnlimitedInternalCode(code: string): boolean {
  const upper = code.trim().toUpperCase();
  // VIP codes handle separately; these are founder/admin/subordinate codes
  return (
    upper.startsWith('OCWS-CORVUS-FOUNDER-') ||
    upper.startsWith('OCWS-ADMIN-') ||
    upper.startsWith('CORVUS-NEST') ||
    upper.startsWith('CORVUS-NATE') ||
    upper.startsWith('CORVUS-ERIC') ||
    upper.startsWith('CORVUS-MIKE') ||
    upper.startsWith('CORVUS-KYLE') ||
    upper.startsWith('CORVUS-TRY-') ||
    upper.startsWith('CORVUS-SUB-')
  );
}

function retentionDaysForTier(tier: string): number {
  if (tier === 'vip' || tier === 'murder') return 365;
  if (tier === 'flock') return 180;
  return 0; // nest and others: no storage
}

function topSeverity(
  criticalCount: number,
  warningCount: number,
  goodCount: number
): ReportSeverity {
  if (criticalCount > 0) return 'critical';
  if (warningCount > 0) return 'warning';
  return 'info';
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('base64');
}

function getMimeType(file: File): string {
  const type = file.type?.toLowerCase();
  const validTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);
  return validTypes.has(type) ? type : 'image/jpeg';
}

export async function POST(request: NextRequest) {
  let creditConsumed = false;
  let consumedCode = '';
  let consumedProduct: ProductType = 'verdict';

  try {
    const formData = await request.formData();

    const code = (formData.get('code') as string | null)?.trim() ?? '';
    const product = (formData.get('product') as string | null)?.trim() ?? 'verdict';
    const clientName = (formData.get('clientName') as string | null)?.trim() ?? '';
    const street = (formData.get('street') as string | null)?.trim() ?? '';
    const city = (formData.get('city') as string | null)?.trim() ?? '';
    const state = (formData.get('state') as string | null)?.trim() ?? 'FL';
    const zip = (formData.get('zip') as string | null)?.trim() ?? '';
    const ssid = (formData.get('ssid') as string | null)?.trim() ?? '';
    const environment = (formData.get('environment') as string | null)?.trim() ?? 'indoor';
    const locationType = (formData.get('locationType') as string | null)?.trim() ?? '';
    const comfortLevelRaw = formData.get('comfortLevel');
    const comfortLevel = comfortLevelRaw ? Number(comfortLevelRaw) : 2;

    const signalListFile = formData.get('signalList') as File | null;
    const ghz24FileRaw = formData.get('ghz24');
    const ghz5FileRaw = formData.get('ghz5');
    const ghz24File = ghz24FileRaw instanceof File ? ghz24FileRaw : null;
    const ghz5File = ghz5FileRaw instanceof File ? ghz5FileRaw : null;

    if (!code) {
      return NextResponse.json({ error: 'Code is required.' }, { status: 400 });
    }
    if (!signalListFile) {
      return NextResponse.json({ error: 'Signal list screenshot is required.' }, { status: 400 });
    }
    if (!clientName) {
      return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
    }

    const productTyped = product as ProductType;
    const address = [street, city, state, zip].filter(Boolean).join(', ');

    // ─── Authorization ─────────────────────────────────────────────────────────

    const upperCode = code.toUpperCase();
    const isVIP = isVIPCode(upperCode);
    const isInternal = isUnlimitedInternalCode(upperCode);

    let validationTier = 'vip';
    let validationSubId: string | null = null;
    let validationCodeType: UsageEvent['codeType'] = 'bypass';

    if (!isVIP && !isInternal) {
      const validation = await validateSubscriptionId(code);

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error ?? 'Invalid or expired subscription code.' },
          { status: 403 }
        );
      }

      validationTier = validation.tier ?? 'nest';
      validationCodeType = validation.type === 'subscription' ? 'subscriber' : 'promo';

      if (validation.type === 'subscription') {
        validationSubId = code;

        // Check credits
        if (productTyped === 'verdict') {
          if (!validation.verdicts_unlimited && (validation.verdicts_remaining ?? 0) <= 0) {
            return NextResponse.json({ error: 'No Verdict credits remaining this billing period.' }, { status: 402 });
          }
        } else {
          const recType = productTyped.replace('reckoning_', '') as 'small' | 'standard' | 'commercial';
          const rem = validation.reckonings_remaining?.[recType] ?? 0;
          const unlimited = validation.reckonings_unlimited?.[recType] ?? false;
          if (!unlimited && rem <= 0) {
            return NextResponse.json(
              { error: `No ${recType} Reckoning credits remaining this billing period.` },
              { status: 402 }
            );
          }
        }

        // Consume credit
        const consumed = await consumeCredit(code, productTyped);
        if (!consumed.success) {
          return NextResponse.json({ error: consumed.error ?? 'Failed to consume credit.' }, { status: 402 });
        }
        creditConsumed = true;
        consumedCode = code;
        consumedProduct = productTyped;
      }
      // promo / founder / admin codes: no credit deduction
    } else if (isVIP) {
      validationTier = 'vip';
      validationCodeType = 'vip';
    } else {
      // internal/founder
      validationTier = 'vip';
      validationCodeType = 'bypass';
    }

    // ─── Convert files to base64 ───────────────────────────────────────────────

    const signalBase64 = await fileToBase64(signalListFile);
    const signalMime = getMimeType(signalListFile);

    let scan24Base64: string | null = null;
    let scan24Mime = 'image/jpeg';
    if (ghz24File) {
      scan24Base64 = await fileToBase64(ghz24File);
      scan24Mime = getMimeType(ghz24File);
    }

    let scan5Base64: string | null = null;
    let scan5Mime = 'image/jpeg';
    if (ghz5File) {
      scan5Base64 = await fileToBase64(ghz5File);
      scan5Mime = getMimeType(ghz5File);
    }

    // ─── Call Corvus analyze ───────────────────────────────────────────────────

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    const analyzeBody: Record<string, unknown> = {
      mode: 'single',
      name: clientName,
      address,
      environment,
      locationType,
      itComfortLevel: comfortLevel,
      client_ssid: ssid,
      images: {
        signal: signalBase64,
        ...(scan24Base64 ? { scan24: scan24Base64 } : {}),
        ...(scan5Base64 ? { scan5: scan5Base64 } : {}),
      },
      mimeTypes: {
        signal: signalMime,
        ...(scan24Base64 ? { scan24: scan24Mime } : {}),
        ...(scan5Base64 ? { scan5: scan5Mime } : {}),
      },
      notes: '',
      honeypot: '',
    };

    const analyzeRes = await fetch(`${baseUrl}/api/crows-eye/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyzeBody),
    });

    if (!analyzeRes.ok) {
      throw new Error(`Analyze API returned ${analyzeRes.status}`);
    }

    const analyzeData = await analyzeRes.json();

    if (!analyzeData.ok) {
      throw new Error(analyzeData.error ?? 'Analysis failed.');
    }

    // ─── Build report ──────────────────────────────────────────────────────────

    const reportId = `OCWS-RPT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    // Map full_findings → findings with lowercase severity
    const rawFindings: Array<{
      severity: string;
      title: string;
      description?: string;
      fix?: string;
      fix_summary?: string;
      steps?: string[];
      router_info?: {
        vendor: string;
        gateway_ip: string | null;
        default_username: string;
        default_password: string;
        confidence: string;
      };
      login_disclaimer?: string;
    }> = analyzeData.full_findings ?? [];

    const findings = rawFindings.map(f => ({
      severity: f.severity?.toUpperCase() ?? 'INFO',
      title: f.title ?? '',
      description: f.description ?? '',
      fix: f.fix ?? '',
      fix_summary: f.fix_summary ?? '',
      steps: f.steps ?? [],
      router_info: f.router_info,
      login_disclaimer: f.login_disclaimer,
    }));

    const recommendations: string[] = Array.isArray(analyzeData.recommendations)
      ? analyzeData.recommendations
      : [];

    const problemsFound = analyzeData.problems_found ?? findings.length;
    const criticalCount = analyzeData.critical_count
      ?? findings.filter(f => f.severity === 'CRITICAL').length;
    const warningCount = analyzeData.warning_count
      ?? findings.filter(f => f.severity === 'WARNING').length;
    const goodCount = analyzeData.good_count
      ?? findings.filter(f => f.severity !== 'CRITICAL' && f.severity !== 'WARNING').length;

    const corvusOpening: string = analyzeData.corvus_opening ?? '';
    const corvusClosing: string = analyzeData.corvus_closing ?? '';
    const corvusAnalysis = [corvusOpening, corvusClosing].filter(Boolean).join(' ');

    const reportPayload = {
      reportId,
      product: productTyped,
      clientName,
      ssid,
      address,
      createdAt,
      corvus_opening: corvusOpening,
      corvusAnalysis,
      corvus_summary: analyzeData.corvus_summary ?? '',
      findings,
      recommendations,
      problems_found: problemsFound,
      critical_count: criticalCount,
      warning_count: warningCount,
      good_count: goodCount,
      identified_ssid: analyzeData.identified_ssid ?? null,
      router_vendor: analyzeData.router_vendor ?? null,
      device: analyzeData.device ?? null,
    };

    // ─── Save report ──────────────────────────────────────────────────────────

    const retentionDays = retentionDaysForTier(validationTier);
    const reportSeverity = topSeverity(criticalCount, warningCount, goodCount);

    const reportRecord: ReportRecord = {
      reportId,
      type: productTyped as ReportRecord['type'],
      subscriptionId: validationSubId,
      email: null,
      codeUsed: code,
      createdAt,
      locationName: clientName,
      findingCount: findings.length,
      severity: reportSeverity,
      reportData: JSON.stringify(reportPayload),
      pdfAvailable: false,
    };

    await saveReport(reportId, reportRecord, retentionDays);

    // Temp report in redis for 24h (for quick retrieval)
    await redis.set(
      `temp_report:${reportId}`,
      JSON.stringify(reportPayload),
      { ex: 86400 }
    );

    // ─── Record analytics event ────────────────────────────────────────────────

    const eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const usageEvent: UsageEvent = {
      eventId,
      timestamp: createdAt,
      code,
      codeType: validationCodeType,
      issuedBy: null,
      subscriptionId: validationSubId,
      tier: validationTier,
      product: productTyped as UsageEvent['product'],
      locationName: clientName,
      locationState: state,
      findingCount: findings.length,
      criticalCount,
      warningCount,
      goodCount,
      severity: reportSeverity,
      itComfortLevel: comfortLevel,
      reportId,
    };

    await recordUsageEvent(usageEvent);

    // ─── Return report ─────────────────────────────────────────────────────────

    return NextResponse.json({ report: reportPayload });
  } catch (err) {
    console.error('run-scan error:', err);

    // Refund credit if we consumed one and analysis failed
    if (creditConsumed && consumedCode) {
      try {
        const sub = await import('@/lib/subscriptions').then(m => m.getSubscription(consumedCode));
        if (sub) {
          if (consumedProduct === 'verdict') {
            await updateSubscription(consumedCode, {
              verdicts_used: Math.max(0, sub.verdicts_used - 1),
            });
          } else {
            const recType = consumedProduct.replace('reckoning_', '') as 'small' | 'standard' | 'commercial';
            await updateSubscription(consumedCode, {
              reckonings_used: {
                ...sub.reckonings_used,
                [recType]: Math.max(0, sub.reckonings_used[recType] - 1),
              },
            });
          }
        }
      } catch (refundErr) {
        console.error('Credit refund failed:', refundErr);
      }
    }

    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
