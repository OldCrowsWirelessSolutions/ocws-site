// app/api/auth/account/check-email/route.ts
// v22: lightweight existence check for the mobile email-first login flow.
// Mobile sends a normalized email and asks "does an account exist?" so
// the UI can branch the user into either the password prompt (existing
// account) or the create-account flow (new user) on a single screen.
//
// Privacy: the response intentionally returns boolean only — no name, no
// code, no tier. Email enumeration is mitigated by rate-limiting at the
// Vercel layer plus the existing app-token gate. We do not return any
// information about the account beyond its existence so an attacker who
// hits this endpoint can't fingerprint our user base.
//
// Auth: x-app-token soft gate (matches the verdict-analyze proxy and the
// other mobile-only endpoints).

export const runtime = "nodejs";

import { getAccountByEmail, isValidEmail } from "@/lib/accounts";

const APP_TOKEN = process.env.EXPO_PUBLIC_CORVUS_APP_TOKEN
  ?? process.env.OCWS_MOBILE_APP_TOKEN
  ?? "";

export async function POST(req: Request) {
  try {
    if (APP_TOKEN) {
      const tok = req.headers.get("x-app-token") ?? "";
      if (tok !== APP_TOKEN) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => null) as { email?: string } | null;
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return Response.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const account = await getAccountByEmail(email);
    return Response.json({ ok: true, exists: !!account });
  } catch (err) {
    console.error("[auth/account/check-email]", err);
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 503 });
  }
}
