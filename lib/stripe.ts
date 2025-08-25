import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not set. Stripe features will be unavailable.")
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20", // Use the latest API version
      typescript: true,
    })
  : null

export async function createPaymentIntent(amount: number, currency = "usd", metadata?: Stripe.MetadataParam) {
  if (!stripe) {
    throw new Error("Stripe is not initialized. STRIPE_SECRET_KEY is missing.")
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Amount in cents
      currency: currency,
      automatic_payment_methods: { enabled: true },
      metadata: metadata,
    })
    return paymentIntent
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  if (!stripe) {
    throw new Error("Stripe is not initialized. STRIPE_SECRET_KEY is missing.")
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    throw error
  }
}

export async function constructEventFromWebhook(body: Buffer, signature: string | string[], secret: string) {
  if (!stripe) {
    throw new Error("Stripe is not initialized. STRIPE_SECRET_KEY is missing.")
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret)
    return event
  } catch (error) {
    console.error("Error constructing Stripe webhook event:", error)
    throw error
  }
}
