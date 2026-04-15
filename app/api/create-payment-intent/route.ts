import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: Request) {
  try {
    const { amount, currency, description } = await req.json()

    if (!amount || !currency) {
      return NextResponse.json(
        { error: 'Amount and currency are required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: description || 'Corvus Purchase',
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json(
      { clientSecret: paymentIntent.client_secret },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}