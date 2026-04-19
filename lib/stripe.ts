// lib/stripe.ts
// Shared Stripe server client. Single source of truth for API version so
// V2 routes don't drift from the existing checkout/webhook handlers.

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});
