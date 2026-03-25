// app/api/analytics/code/route.ts
// Returns analytics summary for a single code.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getEventsForCode, buildSummary } from "@/lib/analytics";
import { validateSubscriptionId } from "@/lib/subscriptions";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "SpectrumLife2026!!";

export async function POST(req: NextRequest) {
  try {
    const body      = await req.json() as { code?: string; adminKey?: string };
    const code      = String(body?.code ?? "").trim().toUpperCase();
    const adminKey  = body?.adminKey ?? req.headers.get("x-admin-key") ?? "";

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    // Validate: code must belong to requester unless admin
    if (adminKey !== ADMIN_KEY) {
      const validation = await validateSubscriptionId(code);
      if (!validation.valid) {
        return NextResponse.json({ error: "Invalid code" }, { status: 403 });
      }
    }

    const events  = await getEventsForCode(code);
    const summary = buildSummary(code, events);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[analytics/code]", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
