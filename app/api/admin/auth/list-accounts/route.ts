// app/api/admin/auth/list-accounts/route.ts
// Admin-only — lists all accounts created via /api/auth/account/create
// for the admin dashboard's USERS tab. Returns metadata only (no password
// hashes).

export const runtime = "nodejs";

import { listAccounts } from "@/lib/accounts";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "SpectrumLife2026!!";

function isAuthed(req: Request): boolean {
  return (req.headers.get("x-admin-key") ?? "") === ADMIN_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthed(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await listAccounts();
    // Strip nothing — AccountRecord has no sensitive fields, password hash
    // lives in a separate Redis key.
    return Response.json({ ok: true, accounts });
  } catch (err) {
    console.error("[admin/auth/list-accounts]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
