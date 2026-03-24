// lib/promo-codes.ts
// One-time promo code generation, validation, redemption, and listing.

import redis from "@/lib/redis";

export type PromoType =
  | "verdict"
  | "reckoning_small"
  | "reckoning_standard"
  | "reckoning_commercial"
  | "reckoning_pro";

export interface PromoCodeRecord {
  code: string;
  type: PromoType;
  createdAt: string;
  createdBy: "admin";
  note: string;
  used: boolean;
  usedAt: string | null;
  usedBy: string | null;
  expiresAt: string | null;
  deactivated?: boolean;
}

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(len: number): string {
  return Array.from(
    { length: len },
    () => CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
}

function codePrefix(type: PromoType): string {
  return type === "verdict" ? "OCWS-VERDICT" : "OCWS-RECKONING";
}

export async function generatePromoCode(
  type: PromoType,
  note = "",
  expiresAt?: string
): Promise<string> {
  const code = `${codePrefix(type)}-${randomSuffix(8)}`;
  const record: PromoCodeRecord = {
    code,
    type,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
    note,
    used: false,
    usedAt: null,
    usedBy: null,
    expiresAt: expiresAt ?? null,
  };
  await redis.set(`promo:${code}`, record);
  await redis.sadd("promo:index", code);
  return code;
}

export async function validatePromoCode(
  code: string
): Promise<{ type: PromoType } | null> {
  const record = await redis.get<PromoCodeRecord>(`promo:${code}`);
  if (!record) return null;
  if (record.used) return null;
  if (record.deactivated) return null;
  if (record.expiresAt && new Date() >= new Date(record.expiresAt)) return null;
  return { type: record.type };
}

export async function redeemPromoCode(
  code: string,
  usedBy?: string
): Promise<boolean> {
  const record = await redis.get<PromoCodeRecord>(`promo:${code}`);
  if (!record || record.used || record.deactivated) return false;
  if (record.expiresAt && new Date() >= new Date(record.expiresAt)) return false;
  await redis.set(`promo:${code}`, {
    ...record,
    used: true,
    usedAt: new Date().toISOString(),
    usedBy: usedBy ?? null,
  });
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
