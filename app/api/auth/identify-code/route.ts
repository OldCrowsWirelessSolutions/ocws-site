// app/api/auth/identify-code/route.ts
// Universal code identification — routes caller to the right dashboard.
// Founding codes are hardcoded, never stored in Redis, never expire, unlimited uses.

export const runtime = "nodejs";

import redis from "@/lib/redis";
import { validatePromoCode } from "@/lib/promo-codes";
import { getAccountByCode } from "@/lib/accounts";

// First name on file for a code, if any — used only to let Corvus greet the
// holder back ("Welcome back, Joshua"). First name only: the minimum PII needed
// for the greeting on this unauthenticated endpoint.
async function firstNameForCode(code: string): Promise<string | undefined> {
  try {
    const acct = await getAccountByCode(code);
    const first = acct?.name?.trim().split(/\s+/)[0];
    return first || undefined;
  } catch {
    return undefined;
  }
}

// ─── Hardcoded codes ─────────────────────────────────────────────────────────

// Admin code — routes to /admin.
// NOTE: NOT uppercased before comparison because it contains special chars.
// Secret lives only in env — no hardcoded fallback (avoids committing a real
// credential). If unset, ADMIN_CODE is "" and the empty-input guard below means
// no one matches it.
const ADMIN_CODE = process.env.OCWS_ADMIN_SECRET ?? "";

// Admin first-factor code — starts two-step admin login flow.
const ADMIN_FIRST_FACTOR_CODE = "OCWS-CORVUS-FOUNDER-JOSHUA";

// Founding codes — unlimited (or lifetime flock for Kyle), never expire, hardcoded server-side.
const FOUNDING_CODES: Record<string, { tier: "nest" | "flock"; name: string }> = {
  "CORVUS-NEST": { tier: "nest", name: "Joshua Turner" },
  "CORVUS-NATE": { tier: "nest", name: "Nathanael Farrelly" },
  "CORVUS-MIKE": { tier: "nest", name: "Mike Arbouret" },
  "CORVUS-ERIC": { tier: "nest", name: "Eric Mims" },
  "CORVUS-KYLE": { tier: "flock", name: "Kyle Pitts" },
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
    return Response.json({ type: "admin", name: "Joshua" });
  }

  // All remaining checks use uppercased input
  const code = raw.toUpperCase();

  // 2. Founding codes — hardcoded, unlimited, never expire
  const founding = FOUNDING_CODES[code];
  if (founding) {
    let passwordSet = false;
    try {
      const hash = await redis.get<string>(`vip:${code}:password_hash`);
      passwordSet = !!hash;
    } catch { /* non-fatal */ }
    return Response.json({ type: "founder", tier: founding.tier, name: founding.name, passwordSet });
  }

  // 3. Admin first-factor — triggers the two-step admin login (code → password,
  // gated by OCWS_ADMIN_SECRET). "ADMIN" is the owner's Corvus Code;
  // OCWS-CORVUS-FOUNDER-JOSHUA is the legacy founder code. Both land here.
  // (Typing the raw secret as the code still works one-step, just above.)
  if (code === ADMIN_FIRST_FACTOR_CODE || code === "ADMIN") {
    return Response.json({ type: "admin_first_factor" });
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
      let passwordSet = false;
      try {
        const hash = await redis.get<string>(`sub:${code}:password_hash`);
        passwordSet = !!hash;
      } catch { /* non-fatal */ }
      const subCode = record.subscriptionId ?? code;
      return Response.json({
        type: "subscriber",
        tier: record.tier ?? null,
        subscriptionId: subCode,
        passwordSet,
        name: await firstNameForCode(subCode),
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
    let passwordSet = false;
    try {
      const hash = await redis.get<string>(`sub:${code}:password_hash`);
      passwordSet = !!hash;
    } catch { /* non-fatal */ }
    return Response.json({ type: "subscriber", subscriptionId: code, passwordSet, name: await firstNameForCode(code) });
  }

  return Response.json({ type: "invalid" });
}
