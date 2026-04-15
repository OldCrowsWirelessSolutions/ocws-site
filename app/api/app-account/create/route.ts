// app/api/app-account/create/route.ts
// Creates a new fledgling account from the web purchase gateway.
// Used when a mobile app user doesn't have an account yet and needs one
// before completing an in-app purchase.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import redis from "@/lib/redis";
import {
  createSubscription,
  generateSubscriptionId,
  getSubscriptionByEmail,
  REDIS_KEYS,
} from "@/lib/subscriptions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "").trim();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Check if email already registered
    const existing = await getSubscriptionByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists. Please log in instead." },
        { status: 409 }
      );
    }

    // Generate subscription ID + create fledgling record (no Stripe sub yet)
    const subscription_id = generateSubscriptionId("fledgling");

    await createSubscription({
      subscription_id,
      customer_email: email,
      customer_name: name,
      tier: "fledgling",
      status: "active",
      stripe_subscription_id: null,
      stripe_customer_id: null,
      current_period_start: null,
      current_period_end: null,
      verdicts_used: 0,
      reckonings_used: { small: 0, standard: 0, commercial: 0 },
      extra_verdict_credits: 0,
    });

    // Hash and store password
    const hash = await bcrypt.hash(password, 10);
    await redis.set(REDIS_KEYS.sub(subscription_id).replace("sub:", "sub:") + ":password_hash_key", hash);
    // Use the same key pattern as verify-password: sub:{code}:password_hash
    await redis.set(`sub:${subscription_id}:password_hash`, hash);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription_id,
      name,
      email,
    });
  } catch (err) {
    console.error("[app-account/create]", err);
    return NextResponse.json({ error: "Account creation failed. Please try again." }, { status: 500 });
  }
}
