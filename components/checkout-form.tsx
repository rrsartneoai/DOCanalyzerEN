"use client"

import type React from "react"

import { useState } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getDictionary } from "@/lib/i18n"

interface CheckoutFormProps {
  orderId: string
}

export function CheckoutForm({ orderId }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const dict = getDictionary("en") // Or dynamically get locale

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}?payment_status=success`,
      },
    })

    // This point will only be reached if there's an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      toast({
        title: dict.orders.paymentFailed,
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: dict.orders.paymentFailed,
        description: dict.common.error,
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <Button disabled={isLoading || !stripe || !elements} className="mt-6 w-full">
        {isLoading ? dict.common.loading : dict.orders.pay}
      </Button>
    </form>
  )
}
