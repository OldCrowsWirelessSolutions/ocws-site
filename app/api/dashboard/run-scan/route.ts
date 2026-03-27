export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { validateSubscriptionId, consumeCredit, updateSubscription } from '@/lib/subscriptions';
import { POST as analyzePost } from '@/app/api/crows-eye/analyze/route';
import type { ProductType } from '@/lib/subscriptions';
import { saveReport } from '@/lib/reports';
import type { ReportRecord, ReportSeverity } from '@/lib/reports';
import { recordUsageEvent } from '@/lib/analytics';
import type { UsageEvent } from '@/lib/analytics';
import { trackSubordinateUsage } from '@/lib/vip-codes';
import { resolveCode } from '@/lib/code-resolver';
import redis from '@/lib/redis';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function retentionDaysForTier(tier: string): number {
  if (tier === 'vip' || tier === 'murder') return 365;
  if (tier === 'flock') return 180;
  return 0; // nest: no storage
}

function topSeverity(
  criticalCount: number,
  warningCount: number,
): ReportSeverity {
  if (criticalCount > 0) return 'critical';
  if (warningCount > 0) return 'warning';
  return 'info';
}

async function fileToBase64(file: Blob): Promise<string> {
  return Buffer.from(await file.arrayBuffer()).toString('base64');
}

function getMimeType(file: Blob): string {
  const t = (file as Blob & { type?: string }).type?.toLowerCase() ?? '';
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(t)
    ? t : 'image/jpeg';
}

async function blobFromFormData(entry: FormDataEntryValue | null): Promise<Blob | null> {
  if (!entry || typeof entry === 'string') return null;
  return entry as Blob;
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let creditConsumed = false;
  let consumedCode = '';
  let consumedProduct: ProductType = 'verdict';

  try {
    const formData = await request.formData();

    const code             = (formData.get('code')             as string | null)?.trim() ?? '';
    const product          = (formData.get('product')          as string | null)?.trim() ?? 'verdict';
    const clientName       = (formData.get('clientName')       as string | null)?.trim() ?? '';
    const street           = (formData.get('street')           as string | null)?.trim() ?? '';
    const city             = (formData.get('city')             as string | null)?.trim() ?? '';
    const state            = (formData.get('state')            as string | null)?.trim() ?? 'FL';
    const zip              = (formData.get('zip')              as string | null)?.trim() ?? '';
    const ssid             = (formData.get('ssid')             as string | null)?.trim() ?? '';
    const environment      = (formData.get('environment')      as string | null)?.trim() ?? 'indoor';
    const locationType     = (formData.get('locationType')     as string | null)?.trim() ?? '';
    const comfortLevel     = Number(formData.get('comfortLevel') ?? 2);
    const clientComplaints = (formData.get('clientComplaints') as string | null)?.trim() ?? '';

    const signalListFile = await blobFromFormData(formData.get('signalList'));
    const ghz24File      = await blobFromFormData(formData.get('ghz24'));
    const ghz5File       = await blobFromFormData(formData.get('ghz5'));

    if (!code)           return NextResponse.json({ error: 'Code is required.' }, { status: 400 });
    if (!signalListFile) return NextResponse.json({ error: 'Signal list screenshot is required.' }, { status: 400 });
    if (!clientName)     return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });

    const productTyped = product as ProductType;
    const address = [street, city, state, zip].filter(Boolean).join(', ');

    // ─── Resolve code type ────────────────────────────────────────────────────

    const resolved = await resolveCode(code);

    if (!resolved.canScan) {
      if (resolved.kind === 'subordinate') {
        return NextResponse.json(
          { error: 'This access code has expired or has already been used.' },
          { status: 403 }
        );
      }
      if (resolved.kind === 'promo') {
        return NextResponse.json(
          { error: 'This promo code has expired or is no longer valid.' },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 403 });
    }

    // ─── Authorization ────────────────────────────────────────────────────────

    let validationTier: string = 'vip';
    let validationSubId: string | null = null;
    let validationCodeType: UsageEvent['codeType'] = 'bypass';

    if (resolved.isBypass) {
      // Founder / VIP / admin / lifetime / subordinate / promo — skip subscription lookup
      validationTier = resolved.tier;
      validationCodeType =
        resolved.kind === 'vip' ? 'vip' :
        resolved.kind === 'subordinate' ? 'bypass' :
        'bypass';
    } else {
      // Real subscriber code — validate and check credits
      const validation = await validateSubscriptionId(code);

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error ?? 'Invalid or expired subscription code.' },
          { status: 403 }
        );
      }

      validationTier     = validation.tier ?? 'nest';
      validationCodeType = validation.type === 'subscription' ? 'subscriber' : 'promo';

      if (validation.type === 'subscription') {
        validationSubId = code;

        if (productTyped === 'verdict') {
          if (!validation.verdicts_unlimited && (validation.verdicts_remaining ?? 0) <= 0) {
            return NextResponse.json({ error: 'No Verdict credits remaining this billing period.' }, { status: 402 });
          }
        } else {
          const recType = productTyped.replace('reckoning_', '') as 'small' | 'standard' | 'commercial';
          const rem     = validation.reckonings_remaining?.[recType] ?? 0;
          const unlim   = validation.reckonings_unlimited?.[recType] ?? false;
          if (!unlim && rem <= 0) {
            return NextResponse.json(
              { error: `No ${recType} Reckoning credits remaining this billing period.` },
              { status: 402 }
            );
          }
        }

        const consumed = await consumeCredit(code, productTyped);
        if (!consumed.success) {
          return NextResponse.json({ error: consumed.error ?? 'Failed to consume credit.' }, { status: 402 });
        }
        creditConsumed  = true;
        consumedCode    = code;
        consumedProduct = productTyped;
      }
    }

    // ─── Track subordinate usage ──────────────────────────────────────────────

    if (resolved.kind === 'subordinate') {
      await trackSubordinateUsage(code).catch(err =>
        console.error('trackSubordinateUsage failed:', err)
      );
    }

    // ─── Convert files to base64 ──────────────────────────────────────────────

    const signalBase64 = await fileToBase64(signalListFile);
    const signalMime   = getMimeType(signalListFile);

    const scan24Base64 = ghz24File ? await fileToBase64(ghz24File) : null;
    const scan24Mime   = ghz24File ? getMimeType(ghz24File) : 'image/jpeg';

    const scan5Base64  = ghz5File  ? await fileToBase64(ghz5File)  : null;
    const scan5Mime    = ghz5File  ? getMimeType(ghz5File)  : 'image/jpeg';

    // ─── Call Corvus analyze (direct function call — bypasses HTTP/auth layer) ──

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let analyzeData: any;
    try {
      const analyzeReq = new Request('http://localhost/api/crows-eye/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          name: clientName,
          address,
          environment,
          locationType,
          itComfortLevel: comfortLevel,
          client_ssid: ssid,
          notes: clientComplaints,
          images: {
            signal: signalBase64,
            ...(scan24Base64 ? { scan24: scan24Base64 } : {}),
            ...(scan5Base64  ? { scan5:  scan5Base64  } : {}),
          },
          mimeTypes: {
            signal: signalMime,
            ...(scan24Base64 ? { scan24: scan24Mime } : {}),
            ...(scan5Base64  ? { scan5:  scan5Mime  } : {}),
          },
          honeypot: '',
        }),
      });

      const analyzeRes = await analyzePost(analyzeReq);

      if (!analyzeRes.ok) {
        const errText = await analyzeRes.text().catch(() => '');
        console.error('[run-scan] analyze error:', analyzeRes.status, errText);
        throw new Error(`Analyze failed (${analyzeRes.status}): ${errText.slice(0, 200)}`);
      }

      analyzeData = await analyzeRes.json();
    } catch (fetchErr) {
      console.error('[run-scan] analyze call failed:', fetchErr);
      throw fetchErr;
    }

    if (!analyzeData || typeof analyzeData !== 'object') {
      throw new Error('Analysis returned empty response.');
    }
    if (analyzeData.error && !analyzeData.full_findings) {
      throw new Error(String(analyzeData.error));
    }

    // ─── Build report ─────────────────────────────────────────────────────────

    const reportId  = `OCWS-RPT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    const rawFindings: Array<{
      severity: string; title: string; description?: string;
      fix?: string; fix_summary?: string; steps?: string[];
      router_info?: { vendor: string; gateway_ip: string | null; default_username: string; default_password: string; confidence: string };
      login_disclaimer?: string;
    }> = analyzeData.full_findings ?? [];

    const findings = rawFindings.map(f => ({
      severity:          f.severity?.toUpperCase() ?? 'INFO',
      title:             f.title ?? '',
      description:       f.description ?? '',
      fix:               f.fix ?? '',
      fix_summary:       f.fix_summary ?? '',
      steps:             f.steps ?? [],
      router_info:       f.router_info,
      login_disclaimer:  f.login_disclaimer,
    }));

    const recommendations: string[] = Array.isArray(analyzeData.recommendations)
      ? analyzeData.recommendations : [];

    const criticalCount = analyzeData.critical_count  ?? findings.filter(f => f.severity === 'CRITICAL').length;
    const warningCount  = analyzeData.warning_count   ?? findings.filter(f => f.severity === 'WARNING').length;
    const goodCount     = analyzeData.good_count      ?? findings.filter(f => f.severity !== 'CRITICAL' && f.severity !== 'WARNING').length;
    const problemsFound = analyzeData.problems_found  ?? findings.length;

    const corvusOpening  = analyzeData.corvus_opening  ?? '';
    const corvusClosing  = analyzeData.corvus_closing  ?? '';
    const corvusAnalysis = [corvusOpening, corvusClosing].filter(Boolean).join(' ');

    const reportPayload = {
      reportId, product: productTyped, clientName, ssid, address, createdAt,
      corvus_opening: corvusOpening, corvusAnalysis,
      corvus_summary: analyzeData.corvus_summary ?? '',
      findings, recommendations,
      problems_found: problemsFound, critical_count: criticalCount,
      warning_count: warningCount, good_count: goodCount,
      identified_ssid: analyzeData.identified_ssid ?? null,
      router_vendor:   analyzeData.router_vendor   ?? null,
      device:          analyzeData.device          ?? null,
      clientComplaints: clientComplaints || null,
    };

    // ─── Save report ──────────────────────────────────────────────────────────

    const retentionDays  = retentionDaysForTier(validationTier);
    const reportSeverity = topSeverity(criticalCount, warningCount);

    const reportRecord: ReportRecord = {
      reportId,
      type:           productTyped as ReportRecord['type'],
      subscriptionId: validationSubId,
      email:          null,
      codeUsed:       code,
      createdAt,
      locationName:   clientName,
      findingCount:   findings.length,
      severity:       reportSeverity,
      reportData:     JSON.stringify(reportPayload),
      pdfAvailable:   false,
    };

    await saveReport(reportId, reportRecord, retentionDays);

    await redis.set(`temp_report:${reportId}`, JSON.stringify(reportPayload), { ex: 86400 });

    // ─── Record analytics event ───────────────────────────────────────────────

    await recordUsageEvent({
      eventId:        `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp:      createdAt,
      code,
      codeType:       validationCodeType,
      issuedBy:       null,
      subscriptionId: validationSubId,
      tier:           validationTier,
      product:        productTyped as UsageEvent['product'],
      locationName:   clientName,
      locationState:  state,
      findingCount:   findings.length,
      criticalCount,
      warningCount,
      goodCount,
      severity:       reportSeverity,
      itComfortLevel: comfortLevel,
      reportId,
    });

    return NextResponse.json({ report: reportPayload });

  } catch (err) {
    console.error('run-scan error:', err);

    // Refund credit if we consumed one and analysis failed
    if (creditConsumed && consumedCode) {
      try {
        const sub = await import('@/lib/subscriptions').then(m => m.getSubscription(consumedCode));
        if (sub) {
          if (consumedProduct === 'verdict') {
            await updateSubscription(consumedCode, { verdicts_used: Math.max(0, sub.verdicts_used - 1) });
          } else {
            const recType = consumedProduct.replace('reckoning_', '') as 'small' | 'standard' | 'commercial';
            await updateSubscription(consumedCode, {
              reckonings_used: { ...sub.reckonings_used, [recType]: Math.max(0, sub.reckonings_used[recType] - 1) },
            });
          }
        }
      } catch (refundErr) {
        console.error('Credit refund failed:', refundErr);
      }
    }

    return NextResponse.json({
      error: 'Analysis failed. Please try again.',
      detail: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
