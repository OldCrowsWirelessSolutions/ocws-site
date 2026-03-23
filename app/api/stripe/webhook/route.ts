import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[stripe/webhook] checkout.session.completed", {
        id: session.id,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
        payment_status: session.payment_status,
      });
      break;
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log("[stripe/webhook] payment_intent.succeeded", { id: pi.id, amount: pi.amount });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[stripe/webhook] ${event.type}`, { id: sub.id, status: sub.status });
      break;
    }
    case "invoice.payment_succeeded": {
      const inv = event.data.object as Stripe.Invoice;
      console.log("[stripe/webhook] invoice.payment_succeeded", { id: inv.id, amount_paid: inv.amount_paid });
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      console.log("[stripe/webhook] invoice.payment_failed", { id: inv.id, customer: inv.customer });
      break;
    }
    default:
      // Unhandled event type — return 200 so Stripe doesn't retry
      break;
  }

  return NextResponse.json({ received: true });
}
