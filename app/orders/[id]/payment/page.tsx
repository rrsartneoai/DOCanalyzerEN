"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Order {
  id: string
  title: string
  analysis_type: string
  priority: string
  price: number
  status: string
}

function PaymentForm({ order }: { order: Order }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [clientSecret, setClientSecret] = useState("")

  useEffect(() => {
    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/orders/${order.id}/payment-intent`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()
        if (response.ok) {
          setClientSecret(data.clientSecret)
        } else {
          setError(data.message || "Failed to create payment intent")
        }
      } catch (err) {
        setError("Network error. Please try again.")
      }
    }

    createPaymentIntent()
  }, [order.id])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsProcessing(true)
    setError("")

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError("Card element not found")
      setIsProcessing(false)
      return
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: "Customer Name", // You can get this from user data
        },
      },
    })

    if (stripeError) {
      setError(stripeError.message || "Payment failed")
      setIsProcessing(false)
    } else if (paymentIntent.status === "succeeded") {
      // Payment successful, redirect to upload page
      router.push(`/orders/${order.id}/upload`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
            },
          }}
        />
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <Button type="submit" className="w-full" disabled={!stripe || isProcessing || !clientSecret}>
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${(order.price / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  )
}

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/auth/login"
          return
        }

        const response = await fetch(`/api/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (response.ok) {
          setOrder(data.order)
        } else {
          setError(data.message || "Failed to fetch order")
        }
      } catch (err) {
        setError("Network error. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || "Order not found"}</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href={`/orders/${order.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Complete Payment</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Order Title:</span>
                  <span>{order.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Analysis Type:</span>
                  <span className="capitalize">{order.analysis_type.replace("-", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Priority:</span>
                  <span className="capitalize">{order.priority}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${(order.price / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Enter your payment details to proceed</CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise}>
                  <PaymentForm order={order} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
