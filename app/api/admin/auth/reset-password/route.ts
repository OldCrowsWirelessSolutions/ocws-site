// app/api/admin/auth/reset-password/route.ts
// Admin-only — force-reset any account's password. Used from the admin
// dashboard's USERS tab when a user reports a forgotten password or
// suspected compromise.
//
// Auth: x-admin-key header (validated via isValidAdminKey against OCWS_ADMIN_SECRET).

export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import redis from "@/lib/redis";
import {
  getAccountByEmail,
  getPasswordKey,
  isStrongEnough,
} from "@/lib/accounts";
import { isValidAdminKey } from "@/lib/adminAuth";

function isAuthed(req: Request): boolean {
  return isValidAdminKey(req.headers.get("x-admin-key"));
}

export async function POST(req: Request) {
  if (!isAuthed(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as { email?: string; newPassword?: string };
    const email       = String(body.email       ?? "").trim().toLowerCase();
    const newPassword = String(body.newPassword ?? "").trim();

    if (!email || !newPassword) {
      return Response.json({ error: "email and newPassword required" }, { status: 400 });
    }
    if (!isStrongEnough(newPassword)) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const account = await getAccountByEmail(email);
    if (!account) {
      return Response.json({ error: "No account with that email" }, { status: 404 });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await redis.set(await getPasswordKey(account.code, account.source), hash);

    // Clear any rate-limit lockout so the user can log in immediately
    try {
      await redis.del(`auth:fail:email:${email}`);
      await redis.del(`auth:fail:${account.code}`);
    } catch { /* non-fatal */ }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[admin/auth/reset-password]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
