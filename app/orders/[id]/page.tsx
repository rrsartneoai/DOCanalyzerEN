import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getDictionary } from "@/lib/i18n"
import { Separator } from "@/components/ui/separator"

interface OrderDetailsPageProps {
  params: {
    id: string
  }
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id: orderId } = params
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  const dict = getDictionary("en") // Or dynamically get locale

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (orderError || !order) {
    console.error("Error fetching order:", orderError)
    return <div className="p-4 text-center text-destructive">{dict.orders.orderNotFound}</div>
  }

  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("*")
    .eq("order_id", order.id)
    .order("uploaded_at", { ascending: true })

  if (documentsError) {
    console.error("Error fetching documents:", documentsError)
    return <div className="p-4 text-center text-destructive">{dict.common.error}</div>
  }

  const isPaid = order.status === "paid" || order.status === "processing" || order.status === "completed"

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{dict.orders.orderSummary}</CardTitle>
            <CardDescription>Order ID: {order.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{dict.common.amount}</p>
                <p className="text-lg font-semibold">{formatCurrency(order.amount, order.currency)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{dict.common.status}</p>
                <p
                  className={`text-lg font-semibold ${
                    order.status === "paid"
                      ? "text-green-600"
                      : order.status === "pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                  }`}
                >
                  {order.status}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{dict.common.createdAt}</p>
                <p className="text-lg">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{dict.common.updatedAt}</p>
                <p className="text-lg">{formatDate(order.updated_at)}</p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-4">
              {!isPaid && (
                <Link href={`/orders/${order.id}/payment`} passHref>
                  <Button>{dict.orders.pay}</Button>
                </Link>
              )}
              {isPaid && (
                <Link href={`/orders/${order.id}/upload`} passHref>
                  <Button variant="outline">{dict.orders.uploadDocument}</Button>
                </Link>
              )}
              {documents.length > 0 && isPaid && (
                <Link href={`/orders/${order.id}/analysis`} passHref>
                  <Button>{dict.orders.documentAnalysis}</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dict.common.file}s for this Order</CardTitle>
            <CardDescription>
              {documents.length > 0 ? "List of uploaded documents." : dict.orders.noDocuments}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border p-4 rounded-md">
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-sm text-muted-foreground">{doc.file_type}</p>
                      <p className="text-xs text-muted-foreground">Uploaded: {formatDate(doc.uploaded_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          doc.upload_status === "uploaded" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {doc.upload_status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          doc.analysis_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : doc.analysis_status === "analyzing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {doc.analysis_status}
                      </span>
                      {doc.analysis_status === "completed" && (
                        <Link href={`/orders/${order.id}/analysis`} passHref>
                          <Button variant="ghost" size="sm">
                            View Analysis
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                <p>{dict.orders.noDocuments}</p>
                {isPaid && (
                  <Link href={`/orders/${order.id}/upload`} passHref>
                    <Button className="mt-4">{dict.orders.uploadDocument}</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
