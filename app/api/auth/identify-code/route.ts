// app/api/auth/identify-code/route.ts
// Universal code identification — routes caller to the right dashboard.
// Founding codes are hardcoded, never stored in Redis, never expire, unlimited uses.

export const runtime = "nodejs";

import redis from "@/lib/redis";
import { validatePromoCode } from "@/lib/promo-codes";

// ─── Hardcoded codes ─────────────────────────────────────────────────────────

// Admin code — routes to /admin.
// NOTE: NOT uppercased before comparison because it contains special chars.
const ADMIN_CODE = process.env.OCWS_ADMIN_SECRET ?? "SpectrumLife2026!!";

// Crow's Eye bypass — valid ONLY on the Crow's Eye page, not for dashboard login.
const CROWSEYE_BYPASS_CODE = "OCWS2026";

// Founding codes — unlimited, never expire, always nest tier, hardcoded server-side.
const FOUNDING_CODES: Record<string, { tier: "nest"; name: string }> = {
  "CORVUS-NEST": { tier: "nest", name: "Joshua Turner" },
  "CORVUS-NATE": { tier: "nest", name: "Nathanael Farrelly" },
  "CORVUS-MIKE": { tier: "nest", name: "Mike Arbouret" },
  "CORVUS-ERIC": { tier: "nest", name: "Eric Mims" },
};

export async function POST(req: Request) {
  let raw: string;
  try {
    const body = await req.json() as { code?: string };
    raw = String(body?.code ?? "").trim();
  } catch {
    return Response.json({ type: "invalid" }, { status: 400 });
  }

  if (!raw) return Response.json({ type: "invalid" });

  // 1. Admin code — exact match, do NOT uppercase (contains special chars)
  if (raw === ADMIN_CODE) {
    return Response.json({ type: "admin" });
  }

  // All remaining checks use uppercased input
  const code = raw.toUpperCase();

  // 2. Founding codes — hardcoded, unlimited, never expire
  const founding = FOUNDING_CODES[code];
  if (founding) {
    return Response.json({ type: "founder", tier: founding.tier, name: founding.name });
  }

  // 3. Crow's Eye bypass — valid only on Crow's Eye page, not here
  if (code === CROWSEYE_BYPASS_CODE) {
    return Response.json({ type: "crowseye_bypass" });
  }

  // 4. Generated subscriber codes — Redis key: code:{code}
  try {
    const record = await redis.get<{
      subscriptionId?: string;
      tier?: string;
      email?: string;
      active?: boolean;
    }>(`code:${code}`);

    if (record && record.active !== false) {
      return Response.json({
        type: "subscriber",
        tier: record.tier ?? null,
        subscriptionId: record.subscriptionId ?? code,
      });
    }
  } catch {
    // Redis unavailable — fall through
  }

  // 5. Generated promo codes — Redis key: promo:{code}
  // These are one-time use and do NOT route to the dashboard
  try {
    const promoResult = await validatePromoCode(code);
    if (promoResult) {
      return Response.json({ type: "promo", promoType: promoResult.type });
    }
  } catch {
    // Fall through
  }

  // 6. Also check if this matches a full subscription ID (OCWS-NEST-XXXXXXXX)
  // These go through the existing validate route on the dashboard, but we
  // can signal "subscriber" here so the login page stores and redirects
  if (/^OCWS-(NEST|FLOCK|MURDER)-[A-Z0-9]{8}$/.test(code)) {
    // The dashboard's loadDashboard will validate fully — we just signal subscriber
    return Response.json({ type: "subscriber", subscriptionId: code });
  }

  return Response.json({ type: "invalid" });
}
