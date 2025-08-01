import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { stripe } from "@/lib/stripe"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, users(*)")
      .eq("id", params.id)
      .eq("user_id", user.userId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.price, // Price is already in cents
      currency: "usd",
      customer: order.users.stripe_customer_id,
      metadata: {
        orderId: order.id,
        userId: user.userId,
        analysisType: order.analysis_type,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update order with payment intent ID
    await supabase.from("orders").update({ stripe_payment_intent_id: paymentIntent.id }).eq("id", order.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Payment intent error:", error)
    return NextResponse.json({ message: "Failed to create payment intent" }, { status: 500 })
  }
}
