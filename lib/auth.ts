// lib/auth.ts
// Server-side authentication helper for V2 API routes.
// Reads `Authorization: Bearer <code>` and returns a resolved user context.
// Bridges the code-based auth model (resolveCode / validateSubscriptionId)
// with the user-object shape V2 endpoints expect.

import type { NextRequest } from "next/server";
import redis from "@/lib/redis";
import { resolveCode } from "@/lib/code-resolver";
import { getVIPCode } from "@/lib/vip-codes";

export interface AuthenticatedUser {
  id: string;                          // access code, normalized to uppercase — serves as userId
  tier: string;                        // owner | teamLead | fledgling | nest | flock | murder | vip | ...
  kind: string;                        // resolved code kind (founder | vip | subscriber | ...)
  team_id?: string;
  team_management_enabled?: boolean;
  team_attribution_enabled?: boolean;
  team_push_notifications?: boolean;
  team_weekly_digest?: boolean;
}

function extractBearer(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  return token || null;
}

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  const raw = extractBearer(req);
  if (!raw) return null;
  const code = raw.toUpperCase();

  const resolved = await resolveCode(code);
  if (resolved.kind === "unknown") return null;

  const overlay = await redis
    .get<Record<string, unknown>>(`corvus:v2:user:${code}`)
    .catch(() => null);

  // Determine effective V2 tier. Persisted overlay wins; otherwise derive from
  // the code's kind so V2 gating works for users who have not yet been
  // bootstrapped into the V2 user record.
  let tier: string = resolved.tier;
  if (overlay && typeof overlay.tier === "string") {
    tier = overlay.tier;
  } else if (resolved.kind === "founder") {
    tier = "owner";
  } else if (resolved.kind === "vip") {
    const vip = getVIPCode(code);
    if (vip?.isTeamLead) tier = "teamLead";
  }

  return {
    id: code,
    tier,
    kind: resolved.kind,
    team_id: typeof overlay?.team_id === "string" ? overlay.team_id : undefined,
    team_management_enabled:
      typeof overlay?.team_management_enabled === "boolean"
        ? overlay.team_management_enabled
        : undefined,
    team_attribution_enabled:
      typeof overlay?.team_attribution_enabled === "boolean"
        ? overlay.team_attribution_enabled
        : undefined,
    team_push_notifications:
      typeof overlay?.team_push_notifications === "boolean"
        ? overlay.team_push_notifications
        : undefined,
    team_weekly_digest:
      typeof overlay?.team_weekly_digest === "boolean"
        ? overlay.team_weekly_digest
        : undefined,
  };
}
