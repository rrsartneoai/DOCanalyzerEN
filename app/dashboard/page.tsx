import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircleIcon, FileTextIcon } from "lucide-react"
import { getDictionary } from "@/lib/i18n" // Assuming i18n setup

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  const dict = getDictionary("en") // Or dynamically get locale

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{dict.dashboard.welcome}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{dict.dashboard.quickActions}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/orders/new" passHref>
              <Button className="w-full h-24 text-lg flex flex-col items-center justify-center gap-2">
                <PlusCircleIcon className="h-8 w-8" />
                {dict.dashboard.startNewAnalysis}
              </Button>
            </Link>
            <Link href="/orders" passHref>
              <Button
                variant="outline"
                className="w-full h-24 text-lg flex flex-col items-center justify-center gap-2 bg-transparent"
              >
                <FileTextIcon className="h-8 w-8" />
                {dict.dashboard.viewPastOrders}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* You can add more dashboard widgets here, e.g., recent orders, usage stats */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p>List of recent orders...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Charts or graphs showing usage...</p>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  )
}
