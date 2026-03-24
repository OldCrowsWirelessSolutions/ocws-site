// app/api/stripe/webhook/route.ts
// Handles Stripe webhook events for both one-time payments and subscriptions.
// Subscription lifecycle: creates DB records, generates Subscription IDs, sends emails.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkEnv } from "@/lib/env-check";

checkEnv();
import {
  createSubscription,
  generateSubscriptionId,
  getSubscription,
  getSubscriptionByStripeId,
  getSubscriptionByEmail,
  updateSubscription,
  resetPeriodCredits,
} from "@/lib/subscriptions";
import { CREDITS_BY_PRICE } from "@/lib/price-map";
import redis from "@/lib/redis";
import type { SubscriptionTier, SubscriptionStatus } from "@/lib/subscriptions";
import {
  sendSubscriptionConfirmation,
  sendPaymentFailedNotice,
} from "@/lib/subscription-email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripePriceIdToTier(priceId: string): SubscriptionTier {
  // Map Stripe price IDs to tiers via env vars.
  // Fallback: parse the price ID string (works for Stripe test mode).
  if (priceId === process.env.STRIPE_PRICE_NEST_MONTHLY  || priceId === process.env.STRIPE_PRICE_NEST_ANNUAL)   return "nest";
  if (priceId === process.env.STRIPE_PRICE_FLOCK_MONTHLY || priceId === process.env.STRIPE_PRICE_FLOCK_ANNUAL)  return "flock";
  if (priceId === process.env.STRIPE_PRICE_MURDER_MONTHLY|| priceId === process.env.STRIPE_PRICE_MURDER_ANNUAL) return "murder";
  const lower = priceId.toLowerCase();
  if (lower.includes("murder")) return "murder";
  if (lower.includes("flock"))  return "flock";
  return "nest";
}

function stripeStatusToLocal(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due")                        return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "cancelled";
  return "expired";
}

async function resolveCustomerEmail(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): Promise<string | null> {
  if (!customer) return null;
  if (typeof customer !== "string") {
    return "email" in customer ? (customer.email ?? null) : null;
  }
  try {
    const c = await stripe.customers.retrieve(customer);
    return c.deleted ? null : (c.email ?? null);
  } catch { return null; }
}

async function resolveCustomerName(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): Promise<string> {
  if (!customer) return "Subscriber";
  if (typeof customer !== "string") {
    return ("name" in customer && customer.name) ? customer.name : "Subscriber";
  }
  try {
    const c = await stripe.customers.retrieve(customer);
    return (!c.deleted && c.name) ? c.name : "Subscriber";
  } catch { return "Subscriber"; }
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleSubscriptionCreated(sub: Stripe.Subscription) {
  const email = await resolveCustomerEmail(sub.customer);
  const name  = await resolveCustomerName(sub.customer);
  if (!email) {
    console.error("[webhook] subscription.created: could not resolve email for", sub.id);
    return;
  }

  // Avoid duplicates if the event fires more than once
  const existing = await getSubscriptionByEmail(email);
  if (existing?.stripe_subscription_id === sub.id) {
    console.log("[webhook] Subscription already recorded, skipping:", existing.subscription_id);
    return;
  }

  const priceId         = sub.items.data[0]?.price?.id ?? "";
  const tier            = stripePriceIdToTier(priceId);
  const subscription_id = generateSubscriptionId(tier);

  await createSubscription({
    subscription_id,
    customer_email:         email,
    customer_name:          name,
    tier,
    status:                 stripeStatusToLocal(sub.status),
    stripe_subscription_id: sub.id,
    stripe_customer_id:     typeof sub.customer === "string" ? sub.customer : (sub.customer?.id ?? null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current_period_start:   new Date((sub as any).current_period_start * 1000).toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current_period_end:     new Date((sub as any).current_period_end   * 1000).toISOString(),
    verdicts_used:          0,
    reckonings_used:        { small: 0, standard: 0, commercial: 0 },
    extra_verdict_credits:  0,
  });

  try {
    await sendSubscriptionConfirmation({
      to:              email,
      customer_name:   name,
      subscription_id,
      tier,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      period_end:      new Date((sub as any).current_period_end * 1000).toISOString(),
    });
  } catch (err) {
    console.error("[webhook] Confirmation email failed (non-fatal):", err);
  }

  console.log(`[webhook] Subscription created: ${subscription_id} for ${email}`);
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const record = await getSubscriptionByStripeId(sub.id);
  if (!record) {
    console.warn("[webhook] subscription.updated: no local record for", sub.id);
    return;
  }
  const priceId = sub.items.data[0]?.price?.id ?? "";
  await updateSubscription(record.subscription_id, {
    status:               stripeStatusToLocal(sub.status),
    tier:                 stripePriceIdToTier(priceId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current_period_end:   new Date((sub as any).current_period_end   * 1000).toISOString(),
  });
  console.log(`[webhook] Subscription updated: ${record.subscription_id} → ${sub.status}`);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const record = await getSubscriptionByStripeId(sub.id);
  if (!record) return;
  await updateSubscription(record.subscription_id, { status: "cancelled" });
  console.log(`[webhook] Subscription cancelled: ${record.subscription_id}`);
}

async function handleInvoicePaid(inv: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invAny = inv as any;
  const stripeSubId: string | null = typeof invAny.subscription === "string"
    ? invAny.subscription
    : (invAny.subscription?.id ?? null);
  if (!stripeSubId) return;

  const record = await getSubscriptionByStripeId(stripeSubId);
  if (!record) return;

  try {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subAny = stripeSub as any;
    await resetPeriodCredits(
      record.subscription_id,
      new Date(subAny.current_period_start * 1000).toISOString(),
      new Date(subAny.current_period_end   * 1000).toISOString(),
    );
    await updateSubscription(record.subscription_id, { status: "active" });
    console.log(`[webhook] Credits reset: ${record.subscription_id}`);
  } catch (err) {
    console.error("[webhook] Credit reset failed:", err);
  }
}

async function handleInvoicePaymentFailed(inv: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invAny = inv as any;
  const stripeSubId: string | null = typeof invAny.subscription === "string"
    ? invAny.subscription
    : (invAny.subscription?.id ?? null);
  if (!stripeSubId) return;

  const record = await getSubscriptionByStripeId(stripeSubId);
  if (!record) return;

  await updateSubscription(record.subscription_id, { status: "past_due" });

  try {
    await sendPaymentFailedNotice({
      to:            record.customer_email,
      customer_name: record.customer_name,
      tier:          record.tier,
    });
  } catch (err) {
    console.error("[webhook] Payment failed email (non-fatal):", err);
  }

  console.log(`[webhook] Subscription past_due: ${record.subscription_id}`);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const sig           = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metaType = session.metadata?.type;

        if (metaType === "credit_purchase") {
          const subId   = session.metadata?.subscriptionId;
          const creditsFromMeta = Number(session.metadata?.credits ?? 0);
          const credits = creditsFromMeta > 0
            ? creditsFromMeta
            : (CREDITS_BY_PRICE[session.metadata?.priceId ?? ""] ?? 0);
          if (subId && credits > 0) {
            const sub = await getSubscription(subId);
            if (sub) {
              await updateSubscription(subId, {
                extra_verdict_credits: sub.extra_verdict_credits + credits,
              });
              console.log(`[webhook] credit_purchase: +${credits} credits → ${subId}`);
            }
          }
        } else if (metaType === "reckoning_purchase") {
          const subId         = session.metadata?.subscriptionId;
          const reckoningType = session.metadata?.reckoningType;
          if (subId && reckoningType) {
            const key   = `purchased_reckonings:${subId}`;
            const entry = JSON.stringify({
              type:        reckoningType,
              purchasedAt: new Date().toISOString(),
              used:        false,
              session_id:  session.id,
            });
            await redis.lpush(key, entry);
            console.log(`[webhook] reckoning_purchase: ${reckoningType} → ${subId}`);
          }
        } else {
          console.log("[webhook] checkout.session.completed", {
            id: session.id, customer_email: session.customer_details?.email,
            amount_total: session.amount_total, mode: session.mode,
          });
        }
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log("[webhook] payment_intent.succeeded", { id: pi.id, amount: pi.amount });
        break;
      }
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
  } catch (handlerErr) {
    // Return 200 to prevent Stripe retries on non-recoverable errors
    console.error(`[webhook] Handler error for ${event.type}:`, handlerErr);
  }

  return NextResponse.json({ received: true });
}
