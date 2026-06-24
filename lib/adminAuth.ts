// lib/adminAuth.ts
// Single source of truth for admin authentication on the server.
//
// SECURITY: the admin secret lives ONLY here, server-side, under OCWS_ADMIN_SECRET.
// It must NEVER be a NEXT_PUBLIC_* / EXPO_PUBLIC_* var (those get inlined into the
// browser bundle and are extractable) and must NEVER have a hardcoded fallback.
// If OCWS_ADMIN_SECRET is unset we FAIL CLOSED — every admin request is rejected —
// rather than silently accepting a baked-in default.
//
// History: a prior browser-exposed admin key (a NEXT_PUBLIC_* var with a
// hardcoded fallback) was readable from the site's JS by anyone. Rotated 2026-06.

import { timingSafeEqual } from "crypto";

/** The server-only admin secret. Empty string if unset (→ all checks fail). */
export function adminSecret(): string {
  return process.env.OCWS_ADMIN_SECRET ?? "";
}

/**
 * Constant-time check of a presented credential against the admin secret.
 * Returns false if the secret is unset or the presented value is missing,
 * so a missing env var can never accidentally authorize anyone.
 */
export function isValidAdminKey(presented: string | null | undefined): boolean {
  const secret = adminSecret();
  if (!secret || !presented) return false;
  const a = Buffer.from(String(presented), "utf8");
  const b = Buffer.from(secret, "utf8");
  // timingSafeEqual throws on length mismatch — guard first (length is not secret).
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Convenience: validate the `x-admin-key` header on a Request. */
export function isAuthorizedAdminRequest(req: Request): boolean {
  return isValidAdminKey(req.headers.get("x-admin-key"));
}

/**
 * The demo-mint token, a SEPARATE narrowly-scoped credential under
 * OCWS_DEMO_MINT_TOKEN. It exists so the mobile app (and any low-trust client)
 * can mint *demo* giveaway codes without holding the master admin secret.
 *
 * Why a second token:
 *  - The master OCWS_ADMIN_SECRET is rotated for security. The app can't be
 *    redeployed every rotation, so binding app minting to the master secret
 *    means every rotation breaks the app (which is exactly what happened).
 *  - This token's power is limited at the call site to `type:'demo'` only —
 *    giveaway codes, no paid-tier or subscription grants. If it leaks, the
 *    blast radius is free demo codes, not full admin.
 *
 * Fail closed: empty string if unset, so a missing env var authorizes no one.
 */
export function demoMintToken(): string {
  return process.env.OCWS_DEMO_MINT_TOKEN ?? "";
}

/**
 * Constant-time check of a presented credential against the demo-mint token.
 * Returns false if the token is unset or the presented value is missing.
 */
export function isValidDemoMintToken(presented: string | null | undefined): boolean {
  const secret = demoMintToken();
  if (!secret || !presented) return false;
  const a = Buffer.from(String(presented), "utf8");
  const b = Buffer.from(secret, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
