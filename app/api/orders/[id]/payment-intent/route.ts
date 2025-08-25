import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { amount } = await req.json()

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // amount in cents
      currency: "usd",
      metadata: { orderId: params.id },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("[PAYMENT_INTENT_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
