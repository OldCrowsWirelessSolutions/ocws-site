import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });

export async function POST(request: NextRequest) {
  try {
    const { code, tier } = await request.json();

    if (!code || !tier) {
      return NextResponse.json({ error: 'Code and tier are required.' }, { status: 400 });
    }

    const priceIds: Record<string, string | undefined> = {
      nest: process.env.PRICE_NEST_ANNUAL,
      flock: process.env.PRICE_FLOCK_ANNUAL,
      murder: process.env.PRICE_MURDER_ANNUAL,
    };

    const priceId = priceIds[tier as string];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier or annual plan not configured.' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { type: 'annual_upgrade', code, tier },
      success_url: `${baseUrl}/dashboard?upgraded=annual`,
      cancel_url: `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('upgrade-annual error:', err);
    return NextResponse.json({ error: 'Failed to create upgrade session.' }, { status: 500 });
  }
}
