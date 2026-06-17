// app/api/auth/set-identity/route.ts
// Website subscriber onboarding. When a subscriber first sets up their Corvus
// code on the web, we capture their NAME + EMAIL (so Corvus greets them back and
// so they can log in by email), set their password, and persist a proper
// AccountRecord — the same identity store the mobile app and email-login use.
//
// Passwords are bcrypt-hashed and NEVER returned; only the name is ever surfaced
// (for the welcome-back greeting). This complements the mobile-shared
// /api/auth/account/create without modifying it: it accepts any valid subscriber
// code (an active code:{code} record, or an OCWS-NEST/FLOCK/MURDER-XXXXXXXX id).

export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import redis from "@/lib/redis";
import {
  AccountRecord,
  AccountTier,
  getAccountByEmail,
  getPasswordKey,
  isStrongEnough,
  isValidEmail,
  saveAccount,
} from "@/lib/accounts";

const SUBSCRIBER_PATTERN = /^OCWS-(NEST|FLOCK|MURDER)-[A-Z0-9]{8}$/;

function tierShape(tier: AccountTier): { credits: number | null; unlimited: boolean } {
  switch (tier) {
    case "fledgling": return { credits: 1,    unlimited: false };
    case "nest":      return { credits: 3,    unlimited: false };
    case "flock":     return { credits: 15,   unlimited: false };
    case "murder":    return { credits: null, unlimited: true  };
    default:          return { credits: 3,    unlimited: false };
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      code?: string; name?: string; email?: string; password?: string;
    };
    const code     = String(body.code     ?? "").trim().toUpperCase();
    const name     = String(body.name     ?? "").trim();
    const email    = String(body.email    ?? "").trim().toLowerCase();
    const password = String(body.password ?? "").trim();

    if (!code) return Response.json({ error: "Missing code." }, { status: 400 });
    if (!name || !email || !password) {
      return Response.json({ error: "Name, email, and password are all required." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: "That doesn't look like a valid email." }, { status: 400 });
    }
    if (!isStrongEnough(password)) {
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Validate the code: an active subscriber record, or a well-formed subscription id.
    const record = await redis
      .get<{ tier?: string; active?: boolean }>(`code:${code}`)
      .catch(() => null);
    const matchesPattern = SUBSCRIBER_PATTERN.test(code);
    if ((!record || record.active === false) && !matchesPattern) {
      return Response.json({ error: "This code can't set up an account here." }, { status: 400 });
    }

    // One email can't attach to two different codes.
    const existingByEmail = await getAccountByEmail(email);
    if (existingByEmail && existingByEmail.code !== code) {
      return Response.json(
        { error: "An account with that email already exists. Log in instead." },
        { status: 409 },
      );
    }

    const tier: AccountTier =
      (record?.tier as AccountTier) ??
      ((code.match(/^OCWS-(NEST|FLOCK|MURDER)-/)?.[1]?.toLowerCase() as AccountTier) || "nest");
    const shape = tierShape(tier);

    // Hash + store the password (never returned). Same key namespace verify-password
    // and email-login already read for subscriber codes (sub:{code}:password_hash).
    const hash = await bcrypt.hash(password, 12);
    await redis.set(await getPasswordKey(code, "subscriber"), hash);

    const account: AccountRecord = {
      code,
      email,
      name,
      tier,
      unlimited: shape.unlimited,
      credits:   shape.credits,
      createdAt: new Date().toISOString(),
      source:    "subscriber",
    };
    await saveAccount(account);

    // Don't echo anything sensitive — name only, for the greeting.
    return Response.json({ ok: true, name: account.name });
  } catch (err) {
    console.error("[auth/set-identity]", err);
    return Response.json({ error: "Setup failed. Please try again." }, { status: 500 });
  }
}
