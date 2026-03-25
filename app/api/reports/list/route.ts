// app/api/reports/list/route.ts
// Returns all reports for a given subscriber code or subscription ID.
// The requester must provide the code — we validate it before returning data.

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getReportsForSubscription, getReportsForEmail } from "@/lib/reports";
import { validateSubscriptionId } from "@/lib/subscriptions";

const FOUNDING_CODES = new Set(["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC"]);

export async function POST(req: Request) {
  try {
    const body = await req.json() as { code?: string; subscriptionId?: string };
    const rawCode = String(body?.code ?? body?.subscriptionId ?? "").trim();
    if (!rawCode) return NextResponse.json({ reports: [] });

    const code = rawCode.toUpperCase();

    // Admin sees everything — handled by /api/admin/reports/list instead
    if (code === "CORVUS-FOUNDER-2026" || FOUNDING_CODES.has(code) || rawCode === (process.env.OCWS_ADMIN_SECRET ?? "")) {
      // Founding/admin codes: fetch by codeUsed index via subscriptionId=code
      const reports = await getReportsForSubscription(code);
      return NextResponse.json({ reports });
    }

    // Full subscription ID (OCWS-TIER-XXXXXXXX)
    const result = await validateSubscriptionId(code);
    if (!result.valid) {
      return NextResponse.json({ reports: [], error: "Invalid code" }, { status: 401 });
    }

    const reports = await getReportsForSubscription(code);
    return NextResponse.json({ reports });
  } catch (err) {
    console.error("[reports/list]", err);
    return NextResponse.json({ reports: [], error: "List failed" }, { status: 500 });
  }
}
