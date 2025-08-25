import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getDictionary } from "@/lib/i18n"

export default async function OrdersPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  const dict = getDictionary("en") // Or dynamically get locale

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (ordersError) {
    console.error("Error fetching orders:", ordersError)
    return <div className="p-4 text-center text-destructive">{dict.common.error}</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{dict.orders.title}</CardTitle>
              <CardDescription>{dict.orders.orderSummary}</CardDescription>
            </div>
            <Link href="/orders/new" passHref>
              <Button>{dict.orders.newOrder}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground">{dict.orders.noData}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dict.orders.orderId}</TableHead>
                      <TableHead>{dict.common.amount}</TableHead>
                      <TableHead>{dict.common.status}</TableHead>
                      <TableHead>{dict.common.createdAt}</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{formatCurrency(order.amount, order.currency)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/orders/${order.id}`} passHref>
                            <Button variant="outline" size="sm">
                              {dict.orders.viewDetails}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
