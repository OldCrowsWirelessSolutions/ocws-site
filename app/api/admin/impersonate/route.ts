// app/api/admin/impersonate/route.ts
// Admin-only: validates a subscriber code so the admin can open their dashboard.
// This is client-side impersonation only — no server-side session spoofing.
// The admin sets the subscriber code in their own localStorage in a new tab.
// Admin's own session is preserved in the original tab.

export const runtime = "nodejs";

import redis from "@/lib/redis";
import { validateSubscriptionId } from "@/lib/subscriptions";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "SpectrumLife2026!!";

function isAuthed(req: Request): boolean {
  const key = req.headers.get("x-admin-key") ?? "";
  return key === ADMIN_SECRET;
}

// Founding codes that are valid for impersonation (always valid, no Redis lookup needed)
const FOUNDING_CODES = new Set(["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC"]);

export async function POST(req: Request) {
  if (!isAuthed(req)) {
    return Response.json({ valid: false, error: "Unauthorized" }, { status: 401 });
  }

  let code: string;
  try {
    const body = await req.json() as { code?: string };
    code = String(body?.code ?? "").trim().toUpperCase();
  } catch {
    return Response.json({ valid: false }, { status: 400 });
  }

  if (!code) return Response.json({ valid: false });

  // 1. Founding codes are always valid
  if (FOUNDING_CODES.has(code)) {
    return Response.json({ valid: true, code, tier: "nest", subscriptionId: code });
  }

  // 2. Full subscription ID — validate against Redis
  try {
    const result = await validateSubscriptionId(code);
    if (result.valid && result.type === "subscription") {
      return Response.json({
        valid: true,
        code,
        tier: result.tier ?? null,
        subscriptionId: code,
      });
    }
    if (result.valid && (result.type === "founder" || result.type === "admin")) {
      return Response.json({ valid: true, code, tier: result.tier ?? "nest", subscriptionId: code });
    }
  } catch { /* fall through */ }

  // 3. Redis code record (generated subscriber codes stored under code:{code})
  try {
    const record = await redis.get<{ subscriptionId?: string; tier?: string; active?: boolean }>(`code:${code}`);
    if (record && record.active !== false) {
      return Response.json({
        valid: true,
        code,
        tier: record.tier ?? null,
        subscriptionId: record.subscriptionId ?? code,
      });
    }
  } catch { /* fall through */ }

  return Response.json({ valid: false });
}
