// app/api/analytics/record/route.ts
// Records a usage event after each Verdict or Reckoning. Fire-and-forget from Crow's Eye.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { recordUsageEvent } from "@/lib/analytics";
import { validateSubscriptionId } from "@/lib/subscriptions";
import type { UsageEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<UsageEvent> & { code?: string };

    const code = String(body?.code ?? "").trim().toUpperCase();
    if (!code) return NextResponse.json({ recorded: false }, { status: 200 });

    // Determine code type
    let codeType: UsageEvent["codeType"] = "bypass";
    let subscriptionId: string | null = null;
    let tier = "unknown";
    let issuedBy: string | null = null;

    if (code.startsWith("CORVUS-SUB-")) {
      codeType   = "subordinate";
      issuedBy   = null; // we don't block on resolving this
    } else if (code.startsWith("CORVUS-ERIC") || code.startsWith("CORVUS-MIKE") || code.startsWith("CORVUS-NATE")) {
      codeType = "vip";
    } else if (code.startsWith("OCWS-") && !code.includes("-NEST-") && !code.includes("-FLOCK-") && !code.includes("-MURDER-")) {
      codeType = "promo";
    } else {
      // Try to determine tier from subscription
      try {
        const validation = await validateSubscriptionId(code);
        if (validation.valid && validation.type === "subscription") {
          codeType       = "subscriber";
          subscriptionId = code;
          tier           = validation.tier ?? "unknown";
        }
      } catch { /* non-fatal */ }
    }

    const eventId = randomBytes(6).toString("hex").toUpperCase();

    const event: UsageEvent = {
      eventId,
      timestamp:     new Date().toISOString(),
      code,
      codeType,
      issuedBy,
      subscriptionId,
      tier,
      product:       body.product ?? "verdict",
      locationName:  body.locationName  ?? "",
      locationState: body.locationState ?? "",
      findingCount:  Number(body.findingCount  ?? 0),
      criticalCount: Number(body.criticalCount ?? 0),
      warningCount:  Number(body.warningCount  ?? 0),
      goodCount:     Number(body.goodCount     ?? 0),
      severity:      body.severity ?? "info",
      itComfortLevel: Number(body.itComfortLevel ?? 2),
      reportId:      body.reportId ?? "",
    };

    // Fire and forget — don't await to avoid blocking Crow's Eye
    recordUsageEvent(event).catch((err) =>
      console.error("[analytics/record] Failed to record event:", err)
    );

    return NextResponse.json({ recorded: true });
  } catch (err) {
    // Non-fatal — never block the UI
    console.error("[analytics/record]", err);
    return NextResponse.json({ recorded: false }, { status: 200 });
  }
}
