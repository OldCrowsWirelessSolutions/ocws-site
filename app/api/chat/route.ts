// app/api/chat/route.ts
// Corvus AI chat endpoint. Validates code, enforces free-tier limits,
// fetches chat history, calls Anthropic, saves response.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildCorvusSystemPrompt, resolveBusinessIntelScope } from "@/lib/corvus-chat";
import { getTodayHoliday, getHolidayGreeting } from "@/lib/corvus-calendar";
import {
  getChatHistory,
  saveChatMessage,
  getMessageCount,
  incrementMessageCount,
} from "@/lib/chat";
import { getReportsForCode, type ReportRecord } from "@/lib/reports";
import { validateSubscriptionId, type SubscriptionTier, type ValidationResult } from "@/lib/subscriptions";
import { consumeChatMessage, chatAccountKey, getChatQuota, getPurchasedChat, consumeFreeChat, peekFreeChat, FREE_CHAT_GENERAL_BUCKET } from "@/lib/chat-quota";
import { getAccountByCode } from "@/lib/accounts";
import { recordChatEvent } from "@/lib/analytics";

const FREE_MESSAGE_LIMIT = 3;

// v28 parity with /api/mobile/corvus-chat: chat runs on Haiku 4.5. Web chat is
// short-form Q&A and product questions — Haiku's reasoning depth is sufficient
// and we pay ~75% less per call than Sonnet. The big knowledge-base prompt is
// served from Anthropic's prompt cache (see CACHED_SYSTEM below), so input cost
// drops ~90% on cache hits on top of the model swap.
// To revert: change to "claude-sonnet-4-6", redeploy. ~90 seconds.
const MODEL_ID = "claude-haiku-4-5-20251001";

// v28 parity: history cap. Each prior turn rides on every request; 8 messages
// (4 exchanges) is enough continuity for support Q&A.
const HISTORY_MAX_MESSAGES = 8;

function buildReportContext(reports: ReportRecord[]): string {
  return reports.map((r, i) => {
    const data = typeof r.reportData === 'string' ? JSON.parse(r.reportData) : r.reportData;
    const findings = data?.full_findings?.slice(0, 5).map((f: { title: string; severity: string }) => `  - ${f.title} (${f.severity})`).join('\n') || '';
    return `SCAN ${i + 1} — ${r.locationName || 'Unknown Location'} — ${new Date(r.createdAt).toLocaleDateString()}
Severity: ${r.severity} | Findings: ${r.findingCount}
${findings}
Summary: ${data?.corvus_summary || 'No summary'}`;
  }).join('\n\n');
}

// "unlimited" — Murder + all bypass codes (admin/founder/vip/subordinate): no metering.
// "metered"   — fledgling/nest/flock subscriptions: monthly pool + purchased top-ups.
// "free"      — promo/trial codes: the legacy 3-message limit (subscribe to continue).
type AccessBand = "unlimited" | "metered" | "free" | "free_account" | "denied";
// `validation` carries the ValidationResult getAccess already fetched, so the
// caller can reuse it (business-intel scope, account-key email) WITHOUT calling
// validateSubscriptionId again. That second call matters: for demo tokens it
// runs validateDemoToken, which increments the token's useCount — re-validating
// per message would silently burn a demo client's limited uses. Bypass codes
// (incl. CORVUS-DEMO-) short-circuit before any validate call and carry no
// validation, so demo chat consumes zero uses.
interface Access { band: AccessBand; tier?: SubscriptionTier; validation?: ValidationResult; email?: string }

async function getAccess(code: string): Promise<Access> {
  if (!code) return { band: "denied" };
  const upper = code.toUpperCase();

  // Admin / founder / VIP / lifetime / subordinate / DEMO bypass codes — all
  // unlimited, and resolved WITHOUT validateSubscriptionId (so demo tokens
  // don't burn a use here).
  const { isKnownBypassCode } = await import("@/lib/code-resolver");
  if (isKnownBypassCode(upper)) return { band: "unlimited" };
  if (process.env.OCWS_ADMIN_SECRET && code === process.env.OCWS_ADMIN_SECRET) return { band: "unlimited" };

  // Partner-portal credential — the help-desk operator chatting about a customer's
  // scan. Partners aren't on the consumer chat economy, so they're unlimited.
  // Verified against the partner store (not just a prefix match) before granting.
  if (upper.startsWith("CORVUS-PARTNER-")) {
    const { getPartnerByCode } = await import("@/lib/partner-channel");
    return (await getPartnerByCode(upper)) ? { band: "unlimited" } : { band: "denied" };
  }

  // Free shell accounts (CORVUS-FREE-…) — non-subscribers with a saved-report
  // account. Included per-report allowance + buyable top-ups. Checked before
  // subscription validation since free codes aren't subscriptions.
  try {
    const acct = await getAccountByCode(upper);
    if (acct && (acct.source === "free" || acct.tier === "free")) {
      return { band: "free_account", email: acct.email };
    }
  } catch { /* fall through to subscription validation */ }

  try {
    const validation = await validateSubscriptionId(upper);
    if (!validation.valid) return { band: "denied", validation };

    if (validation.type === "subscription") {
      const tier = validation.tier ?? "nest";
      // Murder is unlimited; every other tier is metered with top-ups. Carry
      // validation either way so murder owners keep their business-intel scope.
      return tier === "murder"
        ? { band: "unlimited", tier, validation }
        : { band: "metered", tier, validation };
    }
    if (validation.type === "vip" || validation.type === "founder" || validation.type === "admin") {
      return { band: "unlimited", validation };
    }
    if (validation.type === "promo") return { band: "free", validation };

    return { band: "denied", validation };
  } catch {
    return { band: "denied" };
  }
}

// Top-up options surfaced to a metered subscriber who has drained their pool.
const CHAT_TOPUPS = [
  { product: "chat-pack-25",  label: "+25 questions",  price: 4 },
  { product: "chat-pack-100", label: "+100 questions", price: 12 },
  { product: "chat-pass-day", label: "Day Pass (24h)", price: 9 },
];

// Non-consuming quota peek. The chat UI calls this on mount so it can render
// the "messages remaining" counter before the first message. Unlimited bands
// (Murder + admin/founder/VIP/subordinate bypass codes) report unlimited:true
// so the UI hides the counter for them. Mirrors the consume keying exactly
// (chatAccountKey) so the number matches what POST will report.
export async function GET(req: NextRequest) {
  try {
    const code = String(new URL(req.url).searchParams.get("code") ?? "").trim();
    if (!code) return NextResponse.json({ ok: false, unlimited: true });

    const access = await getAccess(code);

    if (access.band === "denied") return NextResponse.json({ ok: false, unlimited: true });
    if (access.band === "unlimited") return NextResponse.json({ ok: true, band: "unlimited", unlimited: true });

    if (access.band === "free") {
      const count = await getMessageCount(code);
      return NextResponse.json({
        ok: true, band: "free", unlimited: false,
        limit: FREE_MESSAGE_LIMIT,
        remaining: Math.max(0, FREE_MESSAGE_LIMIT - count),
      });
    }

    // free_account — 5 included questions per report (or general), then top-ups.
    if (access.band === "free_account") {
      const reportId = String(new URL(req.url).searchParams.get("reportId") ?? "").trim();
      const bucket = reportId || FREE_CHAT_GENERAL_BUCKET;
      const acctKey = chatAccountKey(access.email, code);
      const snap = await peekFreeChat(acctKey, bucket);
      const topup = await getPurchasedChat(acctKey).catch(() => ({ passActive: false, balance: 0 }));
      return NextResponse.json({
        ok: true, band: "free", unlimited: false,
        tier: "free",
        limit: snap.limit,
        remaining: snap.remaining + (topup.passActive ? 9999 : topup.balance),
        monthlyRemaining: snap.remaining,
        purchasedBalance: topup.balance,
        passActive: topup.passActive,
      });
    }

    // metered — monthly pool + purchased balance; an active pass reads as plenty.
    const accountKey = chatAccountKey(access.validation?.customer_email, code);
    const q = await getChatQuota(accountKey, access.tier!);
    const remaining = q.monthlyRemaining < 0
      ? -1
      : q.monthlyRemaining + q.purchasedBalance;
    return NextResponse.json({
      ok: true, band: "metered", unlimited: false,
      tier: access.tier,
      limit: q.monthlyAllowance,
      remaining,
      monthlyRemaining: q.monthlyRemaining,
      purchasedBalance: q.purchasedBalance,
      passActive: !!q.passActiveUntil,
      resetsOn: q.resetsOn,
    });
  } catch (err) {
    console.error("[chat][GET] quota peek failed:", err);
    // Fail-open to unlimited so a peek failure never blocks chatting.
    return NextResponse.json({ ok: false, unlimited: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; message?: string; comfortLevel?: number; reportContext?: string; reportId?: string; attachments?: Array<{ base64: string; mediaType: string; name: string }> };
    const code    = String(body?.code    ?? "").trim();
    const reportId = body?.reportId ? String(body.reportId).trim() : "";
    const message = String(body?.message ?? "").trim().slice(0, 2000);
    const comfortLevel = Number(body?.comfortLevel ?? 2);
    const reportContext = body?.reportContext ? String(body.reportContext).slice(0, 4000) : null;
    const attachments = body?.attachments ?? [];

    console.log("[chat] received:", { code: code ? `${code.slice(0, 8)}...` : "(empty)", messageLen: message.length });

    if (!code || (!message && (!attachments || attachments.length === 0))) {
      return NextResponse.json({ error: "Missing code or message" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[chat] ANTHROPIC_API_KEY is not set");
      return NextResponse.json({ error: "Chat unavailable — API key not configured." }, { status: 500 });
    }

    // ── Access check ─────────────────────────────────────────────────────────
    const access = await getAccess(code);
    if (access.band === "denied") {
      return NextResponse.json({ error: "Invalid or inactive code" }, { status: 401 });
    }

    // Promo/trial: legacy 3-message cap → subscribe to continue.
    if (access.band === "free") {
      const count = await getMessageCount(code);
      if (count >= FREE_MESSAGE_LIMIT) {
        return NextResponse.json({
          limited: true,
          message: "You've used your 3 free messages. Subscribe from $10/mo for Corvus access.",
          messagesRemaining: 0,
        });
      }
    }

    // Metered subscribers: consume from pass → monthly pool → purchased balance.
    // Consume up front (cheapest, race-free); a rare downstream failure burns one
    // question, invisible against a 100–1000 pool. Murder never reaches here.
    // Key top-ups by the canonical account identity (subscription email),
    // normalized, so a pack/pass bought on mobile (keyed by login email) works
    // here too and vice-versa.
    const accountKey = chatAccountKey(access.email ?? access.validation?.customer_email, code);
    let meteredRemaining: number | undefined;

    // Free accounts: 5 included questions per report (or "general"), then top-ups.
    if (access.band === "free_account") {
      const bucket = reportId || FREE_CHAT_GENERAL_BUCKET;
      const consumed = await consumeFreeChat(accountKey, bucket);
      if (!consumed.allowed) {
        return NextResponse.json({
          limited: true,
          message: "That's your free questions for this report — grab a question pack or a Day Pass and Corvus keeps going. Or run a fresh scan for five more.",
          messagesRemaining: 0,
          topups: CHAT_TOPUPS,
        });
      }
      if (consumed.source === "included") meteredRemaining = consumed.remaining;
    }

    if (access.band === "metered") {
      const consumed = await consumeChatMessage(accountKey, access.tier!);
      if (!consumed.allowed) {
        const resetLabel = new Date(consumed.resetsOn).toLocaleDateString("en-US", { month: "long", day: "numeric" });
        return NextResponse.json({
          limited: true,
          message: `That's the last of this month's Corvus questions — they reset ${resetLabel}. Grab a pack or a Day Pass and we keep going. Or wait it out. I'll be here, judging your channel selection.`,
          messagesRemaining: 0,
          topups: CHAT_TOPUPS,
        });
      }
      if (consumed.source === "monthly" && consumed.monthlyRemaining >= 0) {
        meteredRemaining = consumed.monthlyRemaining;
      }
    }

    // ── Build context ─────────────────────────────────────────────────────────
    const [history, recentReports] = await Promise.all([
      getChatHistory(code),
      getReportsForCode(code),
    ]);
    const lastVerdict = recentReports.length > 0 ? buildReportContext(recentReports.slice(0, 5)) : null;

    const reportContextInjection = reportContext
      ? `\n\nACTIVE REPORT CONTEXT — USE THIS FOR ALL RESPONSES:\n${reportContext}\n\nCRITICAL: Answer all questions with specific reference to THIS scan. Never give generic Wi-Fi advice when you have specific data from this report. Reference specific findings, locations, and recommendations from the report above.`
      : "";

    const contextInjection = !reportContext && lastVerdict
      ? `\n\nUSER'S SCAN HISTORY (${recentReports.length} scan${recentReports.length !== 1 ? 's' : ''} on record — most recent first):\n${lastVerdict}\n\nReference scan history naturally when relevant. If the user asks about previous scans, comparisons, or trends — use this data. If they ask about a specific location reference the matching scan.`
      : "";

    const comfortNote = comfortLevel
      ? `\n\nUSER COMFORT LEVEL: ${comfortLevel}/5 — adapt language accordingly.`
      : "";

    const holiday = getTodayHoliday();
    const holidayGreetingLine = holiday ? getHolidayGreeting(holiday.type, false, new Date().getFullYear()) : null;
    const isSolemn = holiday?.type === 'good_friday';
    const holidayNote = holiday
      ? `\n\nTODAY IS ${holiday.name.toUpperCase()}. You are aware of this. ${isSolemn ? "This is a solemn day. No humor today — respond with appropriate weight and respect." : `If it comes up naturally in conversation, you may acknowledge it in your voice. Your holiday line: "${holidayGreetingLine ?? holiday.name}"`}`
      : "";

    const todayNote = `\n\nTODAY'S DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    // Resolve V2 business intel scope. V1 subscription codes never produce
    // 'owner' or 'teamLead' tiers, so scope is always 'none' for V1 users and
    // the business intel block is empty.
    // Reuse the validation getAccess already fetched — do NOT call
    // validateSubscriptionId again. Bypass codes (incl. demo tokens) carry no
    // validation here, so demo tokens consume zero uses per message.
    const subForScope = access.validation ?? null;
    const businessIntelScope = resolveBusinessIntelScope({
      tier: subForScope?.v2_tier ?? subForScope?.tier,
      team_management_enabled: subForScope?.team_management_enabled,
    });
    console.log(`[Corvus] business_intel_scope=${businessIntelScope} code=${code.slice(0, 8)}`);

    // Prompt caching: the base prompt (persona + RF knowledge base + business
    // intel block) is identical across requests for a given scope, so it goes
    // in its own system block marked with cache_control. Everything per-request
    // (report context, scan history, comfort level, holiday, date, attachment
    // capabilities) goes in a SECOND, uncached block — caching is a prefix
    // match, so dynamic bytes must come after the cache breakpoint or nothing
    // ever hits. The knowledge base only changes on admin updates, which just
    // triggers one cache rewrite.
    const systemPromptBase = await buildCorvusSystemPrompt(businessIntelScope);
    let dynamicSystem = reportContextInjection + contextInjection + comfortNote + holidayNote + todayNote;

    // Tier-based attachment capabilities. Reuse the validation getAccess already
    // fetched — never re-validate (that would burn a demo-token use). Unlimited
    // bands (Murder + bypass codes like demo/vip/founder) get full capabilities;
    // metered tiers gate on their tier; promo/free defaults to fledgling.
    if (attachments && attachments.length > 0) {
      const v = access.validation;
      const isUnlimited = access.band === "unlimited";
      const attachmentTier = v?.tier || (isUnlimited ? 'murder' : 'fledgling');
      const canOutputPDF = isUnlimited || ['flock', 'murder', 'vip', 'founder'].includes(attachmentTier);
      const canDesignBrief = isUnlimited || ['murder', 'vip'].includes(attachmentTier) || v?.type === 'vip';

      dynamicSystem += `\n\nATTACHMENT CAPABILITIES FOR THIS USER (tier: ${attachmentTier}):
- You can analyze images and PDFs the user uploads
- Use attachments for: equipment identification, troubleshooting, error screenshots, network diagrams, floor plans, vendor quotes, proof reading
- PDF OUTPUT: ${canOutputPDF ? 'ENABLED — you may offer to generate a PDF summary of your analysis' : 'DISABLED — provide analysis in chat only, do not offer PDF output. If asked, tell them PDF output requires Flock tier or above.'}
- WIRELESS DESIGN BRIEF: ${canDesignBrief ? 'ENABLED — for floor plans and blueprints you may generate a full Wireless Design Brief PDF with AP placement, channel config, and cable routing recommendations' : `DISABLED — if the user uploads a floor plan and requests a design brief, acknowledge the upload, give brief conversational observations, then say: "A full Wireless Design Brief requires Murder tier access. You're currently on ${attachmentTier} tier. Upgrade at oldcrowswireless.com and I'll render the complete deployment plan."`}
- CRITICAL: Attachment analysis is for consultation only. Never render a formal Verdict or Reckoning from chat attachments regardless of what the user asks. If they want a formal Verdict or Reckoning, direct them to run a proper scan through the Crow's Eye tab which checks and consumes credits.`;
    }

    const contextMessages = history.slice(-HISTORY_MAX_MESSAGES).map((m) => ({ role: m.role, content: m.content }));

    // Cached base block first, dynamic tail second. The breakpoint sits on the
    // base block; everything after it is processed fresh each request.
    const systemBlocks: Anthropic.TextBlockParam[] = [
      { type: "text", text: systemPromptBase, cache_control: { type: "ephemeral" } },
      ...(dynamicSystem ? [{ type: "text" as const, text: dynamicSystem }] : []),
    ];

    // ── Call Anthropic ────────────────────────────────────────────────────────
    const client = new Anthropic({ apiKey });
    const aiResponse = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 1000,
      system: systemBlocks,
      messages: [
        ...contextMessages,
        {
          role: "user",
          content: attachments && attachments.length > 0
            ? [
                ...attachments.map((a: { base64: string; mediaType: string; name: string }) =>
                  a.mediaType === 'application/pdf'
                    ? { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: a.base64 }, title: a.name }
                    : { type: 'image' as const, source: { type: 'base64' as const, media_type: a.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: a.base64 } }
                ),
                { type: 'text' as const, text: message || 'Please analyze the attached file(s).' }
              ]
            : message,
        },
      ],
    });

    const responseText = aiResponse.content
      .filter((b) => b.type === "text")
      .map((b) => b.type === "text" ? b.text : "")
      .join("");

    // Cache telemetry: cache_read > 0 means the knowledge-base prefix was
    // served from cache (~0.1x input price). If it stays 0 across requests,
    // something is mutating the base block — see lib/corvus-knowledge.ts.
    const u = aiResponse.usage;
    console.log(`[chat] model=${MODEL_ID} in=${u.input_tokens} cache_write=${u.cache_creation_input_tokens ?? 0} cache_read=${u.cache_read_input_tokens ?? 0} out=${u.output_tokens}`);

    // ── Save history ──────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    await Promise.all([
      saveChatMessage(code, { role: "user",      content: message,      timestamp: now }),
      saveChatMessage(code, { role: "assistant", content: responseText,  timestamp: now }),
    ]);

    // ── Track + limit ─────────────────────────────────────────────────────────
    recordChatEvent(code).catch(() => {});

    let messagesRemaining: number | undefined = meteredRemaining;
    if (access.band === "free") {
      await incrementMessageCount(code);
      const newCount = await getMessageCount(code);
      messagesRemaining = Math.max(0, FREE_MESSAGE_LIMIT - newCount);
    }

    return NextResponse.json({ response: responseText, messagesRemaining });
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
