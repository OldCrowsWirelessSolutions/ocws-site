// app/api/auth/account/create/route.ts
// Creates a real email-indexed account from a redeemed VIP / flock / murder code.
//
// v18 and earlier: VIP codes (CORVUS-NATE etc.) just resolved locally on the
// device — anyone who guessed the code got the same persistent session.
// v19: redeeming any "permanent identity" code now requires the user to
// supply name + email + password, and that becomes their actual login
// credential going forward.
//
// This endpoint is the bridge: validates the code, hashes the password with
// bcrypt, stores both the password hash (under the same `vip:{code}:password_hash`
// key that the existing /api/auth/set-password route uses) AND a parallel
// account profile under account:{code} indexed by email. If the account
// includes team-lead-eligible tier (flock / murder / founder), it also
// auto-creates the team-lead profile so the dashboard works on first login.

export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import redis from "@/lib/redis";
import {
  AccountRecord,
  AccountTier,
  generateFreeCode,
  getAccountByCode,
  getAccountByEmail,
  getPasswordKey,
  isStrongEnough,
  isValidEmail,
  saveAccount,
} from "@/lib/accounts";
import {
  ensureTeamLead,
  redeemSubordinateCode,
  getTeamLeadByCode,
} from "@/lib/team-leads";
import { redeemPromoCode, validatePromoCode } from "@/lib/promo-codes";

// VIP codes that bootstrap a permanent identity. Match coderedeem.tsx VALID_CODES
// on the mobile side. The admin secret is admin-only and bypasses this flow.
const VIP_CODE_PROFILE: Record<string, {
  name:    string;
  tier:    AccountTier;
  orgId:   string;
  orgName: string;
  leadCode: string;
}> = {
  "CORVUS-NATE": { name: "Nathanael Farrelly", tier: "murder", orgId: "org_nate",  orgName: "Farrelly Wireless",            leadCode: "CORVUS-LEAD-NATE"   },
  "CORVUS-MIKE": { name: "Mike Arbouret",      tier: "murder", orgId: "org_fci",   orgName: "First City Internet",          leadCode: "CORVUS-LEAD-MIKE"   },
  "CORVUS-ERIC": { name: "Eric Mims",          tier: "murder", orgId: "org_uhs",   orgName: "University of Houston System", leadCode: "CORVUS-LEAD-ERIC"   },
  "CORVUS-KYLE": { name: "Kyle Pitts",         tier: "flock",  orgId: "org_kyle",  orgName: "Kyle's Team",                  leadCode: "CORVUS-LEAD-KYLE"   },
};

const SUBSCRIBER_PATTERN = /^OCWS-(NEST|FLOCK|MURDER)-[A-Z0-9]{8}$/;

function tierToShape(tier: AccountTier): { credits: number | null; unlimited: boolean } {
  switch (tier) {
    case "fledgling": return { credits: 1,    unlimited: false };
    case "nest":      return { credits: 3,    unlimited: false };
    case "flock":     return { credits: 15,   unlimited: false };
    case "murder":    return { credits: null, unlimited: true  };
    default:          return { credits: null, unlimited: true  };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      code?:     string;
      name?:     string;
      email?:    string;
      password?: string;
      // For OCWS-FLOCK/MURDER-* server-redeemed promo codes, the caller
      // supplies the tier they were granted so we can store it on the account.
      tier?:     AccountTier;
    };

    const code     = String(body.code     ?? "").trim().toUpperCase();
    const name     = String(body.name     ?? "").trim();
    const email    = String(body.email    ?? "").trim().toLowerCase();
    const password = String(body.password ?? "").trim();

    if (!name || !email || !password) {
      return Response.json({ error: "name, email, password required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!isStrongEnough(password)) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // ── First-time signup with NO entitlement code → mint a free shell account.
    // Every signup gets a Corvus Code (identity + recovery for everyone); a free
    // shell carries 0 paid credits until the holder buys or redeems. If they
    // later purchase, the Stripe webhook upgrades THIS account by email.
    if (!code) {
      const existing = await getAccountByEmail(email);
      if (existing) {
        return Response.json(
          { error: "An account with that email already exists. Log in instead." },
          { status: 409 },
        );
      }
      const freeCode = await generateFreeCode();
      const hash = await bcrypt.hash(password, 12);
      await redis.set(await getPasswordKey(freeCode, "free"), hash);
      const account: AccountRecord = {
        code:      freeCode,
        email,
        name,
        tier:      "free",
        unlimited: false,
        credits:   0,
        createdAt: new Date().toISOString(),
        source:    "free",
      };
      await saveAccount(account);
      return Response.json({ ok: true, account });
    }

    // Refuse if email is already attached to a different code
    const existingByEmail = await getAccountByEmail(email);
    if (existingByEmail && existingByEmail.code !== code) {
      return Response.json(
        { error: "An account with that email already exists. Log in instead." },
        { status: 409 },
      );
    }

    // Refuse if code already has an account (must use admin password reset, not re-create)
    const existingByCode = await getAccountByCode(code);
    if (existingByCode) {
      return Response.json(
        { error: "This code already has an account. Log in with your email and password, or ask the admin to reset it." },
        { status: 409 },
      );
    }

    // Determine source + profile
    let source:  AccountRecord["source"];
    let profile: { name: string; tier: AccountTier; orgId?: string; orgName?: string; suggestedLeadCode?: string };

    if (VIP_CODE_PROFILE[code]) {
      const v = VIP_CODE_PROFILE[code];
      source  = "vip";
      profile = { name: v.name, tier: v.tier, orgId: v.orgId, orgName: v.orgName, suggestedLeadCode: v.leadCode };
    } else if (code.startsWith("CORVUS-ORG-")) {
      // Subordinate redeeming a team-invite code. Server-side redemption
      // looks up the lead's org context and assigns the subordinate a
      // userId atomically. The bcrypt hash is stored under sub:{code}:password_hash
      // so future logins by email work the same way as for any other source.
      const sub = await redeemSubordinateCode({ accessCode: code, name, email });
      if (!sub) {
        return Response.json({ error: "Invalid or already redeemed team code" }, { status: 410 });
      }
      source  = "subordinate";
      profile = {
        name,
        tier:    "subordinate",
        orgId:   sub.orgId,
        orgName: sub.orgName,
      };
      // Subordinates inherit team-lead context for posting verdicts.
      const parentLead = await getTeamLeadByCode(sub.leadCode);
      const subAccount = {
        // assignment after save below — we need the leadCode + userId on the
        // record, not the lead's userId, but the subordinate's userId
        // generated during redeemSubordinateCode.
        subLeadCode: sub.leadCode,
        subUserId:   sub.userId ?? `sub_${Date.now().toString(36)}`,
        parentLead,
      };
      // Hash and save before tail logic kicks in
      const hash = await bcrypt.hash(password, 12);
      await redis.set(await getPasswordKey(code, "subordinate"), hash);
      const account: AccountRecord = {
        code,
        email,
        name,
        tier:      "subordinate",
        unlimited: true,
        credits:   null,
        leadCode:  subAccount.subLeadCode,
        userId:    subAccount.subUserId,
        orgId:     sub.orgId,
        orgName:   sub.orgName,
        createdAt: new Date().toISOString(),
        source:    "subordinate",
      };
      await saveAccount(account);
      return Response.json({ ok: true, account, subordinate: sub });
    } else if (SUBSCRIBER_PATTERN.test(code) || code.startsWith("OCWS-FLOCK-PROMO-") || code.startsWith("OCWS-MURDER-PROMO-") || code.startsWith("OCWS-NEST-PROMO-")) {
      // Server-redeemed flock/murder/nest promo. Validate the code is still
      // valid (race-condition safety — could have expired between dry-run
      // validation on the client and this final account-creation call).
      const validation = await validatePromoCode(code);
      if (!validation) {
        return Response.json({ error: "Code is no longer valid" }, { status: 410 });
      }
      const granted = (body.tier ?? validation.tier ?? "flock") as AccountTier;
      source  = "subscriber";
      profile = { name, tier: granted };
      // Auto-name a personal org for new flock/murder subscribers
      if (granted === "flock" || granted === "murder") {
        profile.orgId   = `org_${code.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 32)}`;
        profile.orgName = `${name}'s Team`;
      }
    } else {
      return Response.json({ error: "Code not eligible for account creation" }, { status: 400 });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);
    await redis.set(await getPasswordKey(code, source), hash);

    // Persist account
    const shape = tierToShape(profile.tier);
    const account: AccountRecord = {
      code,
      email,
      name:      profile.name || name,
      tier:      profile.tier,
      unlimited: shape.unlimited,
      credits:   shape.credits,
      orgId:     profile.orgId,
      orgName:   profile.orgName,
      createdAt: new Date().toISOString(),
      source,
    };

    // If team-lead-eligible (founder/flock/murder), auto-create team lead profile
    if (profile.tier === "flock" || profile.tier === "murder" || source === "vip") {
      if (account.orgId && account.orgName) {
        const lead = await ensureTeamLead({
          userId:            `lead_${code.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 32)}`,
          name:              account.name,
          email:             account.email,
          orgId:             account.orgId,
          orgName:           account.orgName,
          maxSubordinates:   profile.tier === "murder" ? 9999 : 25,
          suggestedLeadCode: profile.suggestedLeadCode,
          source:            source === "vip" ? "vip" : "subscriber",
        });
        account.leadCode = lead.leadCode;
        account.userId   = lead.userId;
      }
    }

    await saveAccount(account);

    // Consume single-use subscriber codes atomically with account creation.
    // VIP codes are not promo records (they're hardcoded) and don't get
    // consumed.
    if (source === "subscriber") {
      try { await redeemPromoCode(code, email); } catch { /* non-fatal */ }
    }

    return Response.json({ ok: true, account });
  } catch (err) {
    console.error("[auth/account/create]", err);
    return Response.json({ error: "Account creation failed" }, { status: 500 });
  }
}
