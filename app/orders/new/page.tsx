"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { getDictionary } from "@/lib/i18n"
import { Loader2Icon } from "lucide-react"

export default function NewOrderPage() {
  const [amount, setAmount] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const dict = getDictionary("en") // Or dynamically get locale

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const parsedAmount = Number.parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parsedAmount, currency: "USD" }), // Hardcode USD for simplicity
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: dict.orders.orderCreated.split("!")[0] + "!",
          description: dict.orders.orderCreated.split("!")[1],
        })
        router.push(`/orders/${data.orderId}/payment`) // Redirect to payment page
      } else {
        toast({
          title: "Order Creation Failed",
          description: data.message || dict.common.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("New order error:", error)
      toast({
        title: "Order Creation Failed",
        description: dict.common.error,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{dict.orders.newOrder}</CardTitle>
          <CardDescription>Enter the amount for your new document analysis order.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{dict.common.amount} (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="25.00"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  {dict.common.loading}
                </>
              ) : (
                dict.common.submit
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
