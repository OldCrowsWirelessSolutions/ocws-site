// app/api/mobile/buy-chat/route.ts
// Mobile chat top-up checkout. The app hits this when a user spends their
// per-scan chat quota and wants more without upgrading. Unlike the web
// /api/subscriptions/buy-chat (which requires a subscription code), this keys
// purchases by the app's own stable identity (accountId = the user's email),
// so registered free users can buy too. Auth is the same x-app-token scheme as
// the other /api/mobile/* routes.
//
// Returns a Stripe Checkout URL the app opens via WebBrowser.openAuthSessionAsync.
// success_url is the app's deep link so the browser closes and returns to chat;
// the actual fulfillment (crediting chat:balance / chat:pass by accountId)
// happens server-to-server in the Stripe webhook.

export const runtime = "nodejs";

import Stripe from "stripe";
import { CHAT_PACKS, CHAT_PASSES, chatAccountKey } from "@/lib/chat-quota";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

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

    const body = await req.json().catch(() => null) as {
      accountId?: string;
      product?: string;
      returnUrl?: string;
    } | null;

    // Normalize to the same canonical key the web side uses (lowercased email),
    // so a top-up bought here also covers this person on the website.
    const accountId = chatAccountKey(body?.accountId, "");
    const product   = String(body?.product ?? "").trim();
    const returnUrl = String(body?.returnUrl ?? "").trim() || "corvus://chat-topup-complete";

    const pack = CHAT_PACKS[product];
    const pass = CHAT_PASSES[product];
    if (!accountId || (!pack && !pass)) {
      return Response.json(
        { ok: false, error: "accountId and a valid chat product are required." },
        { status: 400 }
      );
    }

    const item     = pack ?? pass!;
    const metadata: Record<string, string> = pack
      ? { type: "chat_pack", accountId, product, questions: String(pack.questions) }
      : { type: "chat_pass", accountId, product, hours: String(pass!.hours) };

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
      success_url: returnUrl,
      cancel_url:  returnUrl,
    });

    return Response.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[mobile/buy-chat]", err);
    return Response.json({ ok: false, error: "Checkout session failed." }, { status: 500 });
  }
}
