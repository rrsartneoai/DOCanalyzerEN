"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckoutForm } from "@/components/checkout-form"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { getDictionary } from "@/lib/i18n"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentPageProps {
  params: {
    id: string
  }
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const { id: orderId } = params
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderAmount, setOrderAmount] = useState<number | null>(null)
  const [orderCurrency, setOrderCurrency] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const dict = getDictionary("en") // Or dynamically get locale

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to create payment intent.")
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
        setOrderAmount(data.amount / 100) // Convert cents to dollars
        setOrderCurrency(data.currency)
      } catch (error: any) {
        console.error("Error fetching payment intent:", error)
        toast({
          title: dict.orders.paymentFailed,
          description: error.message || dict.common.error,
          variant: "destructive",
        })
        router.push(`/orders/${orderId}`) // Redirect back to order details on error
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchPaymentIntent()
    }
  }, [orderId, router, dict])

  const appearance: StripeElementsOptions["appearance"] = {
    theme: "stripe",
    variables: {
      colorPrimary: "#6366F1", // Indigo-500
      colorBackground: "#ffffff",
      colorText: "#1F2937", // Gray-800
      colorDanger: "#EF4444", // Red-500
      fontFamily: "Inter, sans-serif",
    },
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{dict.orders.paymentDetails}</CardTitle>
          <CardDescription>
            {orderAmount !== null && orderCurrency !== null
              ? `Total: ${formatCurrency(orderAmount, orderCurrency)}`
              : dict.orders.paymentPending}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground">{dict.common.loading}</div>
          ) : clientSecret && stripePromise ? (
            <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
              <CheckoutForm orderId={orderId} />
            </Elements>
          ) : (
            <div className="text-center text-destructive">{dict.orders.paymentFailed}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
