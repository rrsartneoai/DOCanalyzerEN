import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature")!

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ message: "Webhook signature verification failed" }, { status: 400 })
    }

    const supabase = createServerClient()

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object

        // Update order status to paid
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            status: "processing",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)

        if (orderError) {
          console.error("Order update error:", orderError)
        }

        // Record payment
        await supabase.from("payments").insert({
          order_id: paymentIntent.metadata.orderId,
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: "succeeded",
        })

        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object

        // Update order status to failed
        await supabase
          .from("orders")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", failedPayment.id)

        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 })
  }
}
