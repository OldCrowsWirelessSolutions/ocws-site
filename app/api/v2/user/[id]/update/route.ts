// app/api/v2/user/[id]/update/route.ts
// V2 user settings write endpoint. Method-scoped (PATCH only), field-allowlisted,
// tier-restricted (teamLead). JSON-merges into corvus:v2:user:{userId}.

import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { redisKeys } from "@/lib/v2-schema";
import { getAuthenticatedUser } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_FIELDS = {
  teamManagementEnabled: "boolean",
  teamAttributionEnabled: "boolean",
  teamPushNotifications: "boolean",
  teamWeeklyDigest: "boolean",
} as const;

type AllowedField = keyof typeof ALLOWED_FIELDS;

function methodNotAllowed() {
  return NextResponse.json(
    { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" },
    { status: 405, headers: { Allow: "PATCH" } },
  );
}

// camelCase in request body maps to snake_case storage so it aligns with the
// overlay shape already consumed by lib/auth.ts and the chat route.
const FIELD_STORAGE_KEY: Record<AllowedField, string> = {
  teamManagementEnabled: "team_management_enabled",
  teamAttributionEnabled: "team_attribution_enabled",
  teamPushNotifications: "team_push_notifications",
  teamWeeklyDigest: "team_weekly_digest",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 },
      );
    }

    if (authUser.id !== params.id) {
      return NextResponse.json(
        { error: "Forbidden", code: "USER_MISMATCH" },
        { status: 403 },
      );
    }

    if (authUser.tier !== "teamLead") {
      console.warn(
        `[v2/user/update] tier_mismatch user=${authUser.id} tier=${authUser.tier}`,
      );
      return NextResponse.json(
        { error: "Forbidden", code: "TIER_MISMATCH" },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | { field?: string; value?: unknown }
      | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "INVALID_BODY" },
        { status: 400 },
      );
    }

    const { field, value } = body;

    if (!field || typeof field !== "string" || !(field in ALLOWED_FIELDS)) {
      console.warn(
        `[v2/user/update] field_not_allowed user=${authUser.id} field=${String(field)}`,
      );
      return NextResponse.json(
        { error: "Field not allowed", code: "FIELD_NOT_ALLOWED" },
        { status: 400 },
      );
    }

    const expectedType = ALLOWED_FIELDS[field as AllowedField];
    if (typeof value !== expectedType) {
      return NextResponse.json(
        {
          error: `Expected ${expectedType} for field ${field}`,
          code: "INVALID_VALUE_TYPE",
        },
        { status: 400 },
      );
    }

    const userKey = redisKeys.user(authUser.id);
    const existing = await redis.get<Record<string, unknown>>(userKey);
    if (!existing) {
      return NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" },
        { status: 404 },
      );
    }

    const storageKey = FIELD_STORAGE_KEY[field as AllowedField];
    const updated = { ...existing, [storageKey]: value, updatedAt: new Date().toISOString() };
    await redis.set(userKey, updated);

    return NextResponse.json({ success: true, field, value });
  } catch (error) {
    console.error("[v2/user/update] unhandled_error", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}

export const GET = methodNotAllowed;
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
