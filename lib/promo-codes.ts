// lib/promo-codes.ts
// One-time promo code generation, validation, redemption, and listing.

import redis from "@/lib/redis";

export type PromoType =
  | "verdict"
  | "reckoning_small"
  | "reckoning_standard"
  | "reckoning_commercial"
  | "reckoning_pro"
  | "sub_fledgling"
  | "sub_nest"
  | "sub_flock"
  | "sub_murder"
  | "sub_any"
  | "demo";

export type PromoProduct =
  | "verdict"
  | "reckoning_small"
  | "reckoning_standard"
  | "reckoning_commercial"
  | "reckoning_pro"
  | "all_reckonings"
  | "both"
  | "sub_fledgling"
  | "sub_nest"
  | "sub_flock"
  | "sub_murder"
  | "sub_any"
  | "demo";

export type ExpiryType =
  | "single_use"
  | "24h"
  | "48h"
  | "72h"
  | "7d"
  | "14d"
  | "30d";

export type DemoTier = "nest" | "flock" | "murder";

export interface PromoCodeRecord {
  code: string;
  type: PromoType;           // kept for backwards compat — maps to product
  products: PromoProduct;
  expiryType: ExpiryType;
  createdAt: string;
  createdBy: "admin";
  note: string;
  used: boolean;
  usedAt: string | null;
  usedBy: string | null;
  expiresAt: string | null;
  deactivated?: boolean;
  // For demo codes only: the tier granted on redemption.
  // Lets the admin pick Nest / Flock / Murder per code at generate time.
  tier?: DemoTier;
}

// Sanitize a user-supplied custom suffix to safe code characters.
// Uppercase, A-Z / 0-9 / hyphen only, max 30 chars after stripping.
function sanitizeCustomSuffix(s: string): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(len: number): string {
  return Array.from(
    { length: len },
    () => CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
}

function codePrefix(products: PromoProduct): string {
  // Demo codes are intentionally CORVUS-* prefixed to match the visual style
  // of the existing CORVUS-NATE / CORVUS-MIKE / CORVUS-ERIC VIP codes —
  // these are handed out as time-windowed multi-use access for investor
  // demos, partner conversations, and event giveaways. Default expiry is
  // 48h (multi-use within window). Single-use is rejected at the admin
  // generate route for the demo product since "single use demo" is a
  // contradiction in this context.
  if (products === "demo") return "CORVUS-DEMO";
  if (products === "verdict") return "OCWS-VERDICT";
  if (products === "both" || products === "all_reckonings") return "OCWS-MULTI";
  if (products === "sub_fledgling") return "OCWS-FLEDGLING";
  if (products === "sub_nest") return "OCWS-NEST-PROMO";
  if (products === "sub_flock") return "OCWS-FLOCK-PROMO";
  if (products === "sub_murder") return "OCWS-MURDER-PROMO";
  if (products === "sub_any") return "OCWS-SUB";
  return "OCWS-RECKONING";
}

function expiryDuration(expiryType: ExpiryType): number | null {
  // returns milliseconds to add, or null for single_use (no time limit)
  switch (expiryType) {
    case "single_use": return null;
    case "24h": return 24 * 3600 * 1000;
    case "48h": return 48 * 3600 * 1000;
    case "72h": return 72 * 3600 * 1000;
    case "7d":  return 7  * 86400 * 1000;
    case "14d": return 14 * 86400 * 1000;
    case "30d": return 30 * 86400 * 1000;
  }
}

// Legacy type → products mapping
function legacyTypeToProducts(type: PromoType): PromoProduct {
  return type as PromoProduct;
}

export async function generatePromoCode(
  type: PromoType,
  note = "",
  expiresAt?: string,
  products?: PromoProduct,
  expiryType?: ExpiryType,
  // For demo codes only: a custom suffix (e.g. "SMITH" → CORVUS-SMITH)
  // and the tier granted on redemption.
  customSuffix?: string,
  tier?: DemoTier,
): Promise<string> {
  const resolvedProducts = products ?? legacyTypeToProducts(type);
  const resolvedExpiryType = expiryType ?? "single_use";

  // Calculate expiresAt from expiryType if not explicitly provided
  let resolvedExpiresAt: string | null = expiresAt ?? null;
  if (!resolvedExpiresAt && resolvedExpiryType !== "single_use") {
    const ms = expiryDuration(resolvedExpiryType);
    if (ms !== null) {
      resolvedExpiresAt = new Date(Date.now() + ms).toISOString();
    }
  }

  // Code shape:
  //   demo + customSuffix → CORVUS-{SUFFIX}      e.g. CORVUS-SMITH
  //   demo without suffix → CORVUS-DEMO-{8rand}  e.g. CORVUS-DEMO-A2B4Z9X3
  //   any other product   → {prefix}-{8rand}     e.g. OCWS-NEST-PROMO-...
  let code: string;
  if (resolvedProducts === "demo" && customSuffix) {
    const sanitized = sanitizeCustomSuffix(customSuffix);
    if (!sanitized) {
      throw new Error("Custom suffix is empty after sanitizing — use letters, numbers, or dashes only.");
    }
    code = `CORVUS-${sanitized}`;
    // Uniqueness check: if a code with this exact name already exists,
    // refuse — admin should pick a different name (e.g. SMITH-2).
    const existing = await redis.get<PromoCodeRecord>(`promo:${code}`);
    if (existing) {
      throw new Error(`Code ${code} already exists. Choose a different name (e.g. ${sanitized}-2).`);
    }
  } else {
    code = `${codePrefix(resolvedProducts)}-${randomSuffix(8)}`;
  }

  const record: PromoCodeRecord = {
    code,
    type,
    products: resolvedProducts,
    expiryType: resolvedExpiryType,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
    note,
    used: false,
    usedAt: null,
    usedBy: null,
    expiresAt: resolvedExpiresAt,
    ...(resolvedProducts === "demo" && tier ? { tier } : {}),
  };
  await redis.set(`promo:${code}`, record);
  await redis.sadd("promo:index", code);
  return code;
}

export async function validatePromoCode(
  code: string
): Promise<{ type: PromoType; products: PromoProduct; tier?: DemoTier } | null> {
  const record = await redis.get<PromoCodeRecord>(`promo:${code}`);
  if (!record) return null;
  if (record.deactivated) return null;
  // Single-use check
  if (record.expiryType === "single_use" && record.used) return null;
  // Time-based check
  if (record.expiresAt && new Date() >= new Date(record.expiresAt)) return null;
  // Legacy: if neither single_use nor time-based expiry, fall back to old used flag
  if (!record.expiryType && record.used) return null;
  return {
    type: record.type,
    products: record.products ?? (record.type as PromoProduct),
    tier: record.tier,
  };
}

export async function redeemPromoCode(
  code: string,
  usedBy?: string
): Promise<boolean> {
  const record = await redis.get<PromoCodeRecord>(`promo:${code}`);
  if (!record || record.deactivated) return false;
  if (record.expiresAt && new Date() >= new Date(record.expiresAt)) return false;
  // Only mark as used for single-use codes
  if (record.expiryType === "single_use" || !record.expiryType) {
    if (record.used) return false;
    await redis.set(`promo:${code}`, {
      ...record,
      used: true,
      usedAt: new Date().toISOString(),
      usedBy: usedBy ?? null,
    });
  }
  return true;
}

export async function listPromoCodes(): Promise<PromoCodeRecord[]> {
  const codes = (await redis.smembers("promo:index")) as string[];
  if (!codes.length) return [];
  const records = await Promise.all(
    codes.map((c) => redis.get<PromoCodeRecord>(`promo:${c}`))
  );
  return records
    .filter((r): r is PromoCodeRecord => r !== null)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function deactivatePromoCode(code: string): Promise<void> {
  const record = await redis.get<PromoCodeRecord>(`promo:${code}`);
  if (!record) return;
  await redis.set(`promo:${code}`, { ...record, deactivated: true });
}
