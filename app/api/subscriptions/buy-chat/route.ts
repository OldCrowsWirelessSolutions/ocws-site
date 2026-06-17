// app/api/subscriptions/buy-chat/route.ts
// Creates a Stripe Checkout session for a chat top-up — either a question pack
// or a time pass. Mirrors buy-credits, but prices inline via price_data so no
// Stripe product/price needs to exist in the dashboard. Fulfillment happens in
// the webhook on checkout.session.completed (metadata.type chat_pack|chat_pass).

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import Stripe from "stripe";
import { validateSubscriptionId } from "@/lib/subscriptions";
import { CHAT_PACKS, CHAT_PASSES, chatAccountKey } from "@/lib/chat-quota";
import { getAccountByCode } from "@/lib/accounts";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; product?: string };
    const code    = String(body?.code ?? "").trim().toUpperCase();
    const product = String(body?.product ?? "").trim();

    const pack = CHAT_PACKS[product];
    const pass = CHAT_PASSES[product];
    if (!code || (!pack && !pass)) {
      return Response.json(
        { error: "code and a valid chat product are required." },
        { status: 400 }
      );
    }

    // Subscribers (except Murder, which is unlimited) AND free accounts can buy
    // top-ups. Resolve the buyer's email either way so the webhook credits the
    // right cross-surface key.
    let customerEmail: string | undefined;
    const result = await validateSubscriptionId(code);
    if (result.valid && result.type === "subscription") {
      if (result.tier === "murder") {
        return Response.json(
          { error: "Murder includes unlimited Corvus — no top-up needed." },
          { status: 400 }
        );
      }
      customerEmail = result.customer_email;
    } else {
      // Not a subscription — allow free shell accounts (non-subscribers with a code).
      const acct = await getAccountByCode(code);
      if (!acct || !(acct.source === "free" || acct.tier === "free")) {
        return Response.json({ error: "Invalid or inactive account." }, { status: 403 });
      }
      customerEmail = acct.email;
    }

    const item     = pack ?? pass!;
    const origin   = req.headers.get("origin") ?? "https://oldcrowswireless.com";
    // accountId = canonical cross-surface key (lowercased email), so this pack/pass
    // also covers the same person on mobile. Falls back to the code if no email.
    const accountId = chatAccountKey(customerEmail, code);
    const metadata: Record<string, string> = pack
      ? { type: "chat_pack", accountId, subscriptionId: code, code, product, questions: String(pack.questions) }
      : { type: "chat_pass", accountId, subscriptionId: code, code, product, hours: String(pass!.hours) };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: item.priceUSD * 100,
          product_data: {
            name: pack ? `Corvus Chat — ${item.label}` : `Corvus ${item.label}`,
          },
        },
        quantity: 1,
      }],
      metadata,
      success_url: `${origin}/dashboard?chat=added`,
      cancel_url:  `${origin}/dashboard`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[buy-chat]", err);
    return Response.json({ error: "Checkout session failed." }, { status: 500 });
  }
}
