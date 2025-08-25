import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

const relevantEvents = new Set([
  "checkout.session.completed",
  "payment_intent.succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
])

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripeClient.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    console.error("Webhook Error:", error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent
          const orderId = paymentIntentSucceeded.metadata?.orderId

          if (orderId) {
            await supabase
              .from("orders")
              .update({ status: "paid", payment_intent_id: paymentIntentSucceeded.id })
              .eq("id", orderId)
            console.log(`Order ${orderId} updated to paid status.`)
          }
          break
        case "checkout.session.completed":
          const checkoutSessionCompleted = event.data.object as Stripe.Checkout.Session
          const sessionOrderId = checkoutSessionCompleted.metadata?.order_id

          if (sessionOrderId && checkoutSessionCompleted.payment_status === "paid") {
            await supabase.from("orders").update({ status: "uploaded" }).eq("id", sessionOrderId)
            console.log(`Order ${sessionOrderId} status updated to 'uploaded' after checkout session completed.`)
          }
          break
        case "customer.subscription.created":
          // Handle customer subscription created event
          break
        case "customer.subscription.updated":
          // Handle customer subscription updated event
          break
        case "customer.subscription.deleted":
          // Handle customer subscription deleted event
          break
        default:
          console.log(`Unhandled event type ${event.type}`)
      }
    } catch (error: any) {
      console.error("Webhook handler failed:", error.message)
      return new NextResponse("Webhook handler failed", { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}
