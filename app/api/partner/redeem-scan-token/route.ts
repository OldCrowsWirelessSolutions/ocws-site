// app/api/partner/redeem-scan-token/route.ts
// Public — a customer redeems a CORVUS-SCAN-* token from the mobile app. The
// redemption is atomic (SETNX inside redeemScanToken), so a double-tap or replay
// can never be billed twice. On success returns a transient "grant" the app
// attaches one free report to and posts back via /api/partner/record-scan.

export const runtime = "nodejs";

import { redeemScanToken } from "@/lib/partner-channel";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { token?: string };
    const token = String(body?.token ?? "").trim().toUpperCase();
    if (!token) {
      return Response.json({ ok: false, error: "token required" }, { status: 400 });
    }

    const result = await redeemScanToken(token);
    if (!result.ok) {
      const status = result.reason === "already_used" ? 409 : 400;
      const message =
        result.reason === "already_used" ? "This code has already been used."
        : result.reason === "expired"    ? "This code has expired. Ask your help desk for a new one."
        : "We don't recognize that code. Double-check it with your help desk.";
      return Response.json({ ok: false, reason: result.reason, error: message }, { status });
    }

    return Response.json({
      ok: true,
      grant: {
        leadCode:   result.leadCode,
        expiresAt:  result.expiresAt,
        reportType: result.reportType ?? "verdict",
      },
      customerName: result.customerName ?? null,
    });
  } catch (err) {
    console.error("[partner/redeem-scan-token]", err);
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 503 });
  }
}
