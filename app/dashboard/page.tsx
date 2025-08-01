"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, Clock, CheckCircle, AlertCircle, BarChart3, CreditCard, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { LanguageSelector } from "@/components/language-selector"

interface Order {
  id: string
  title: string
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: string
  documentsCount: number
  price: number
}

interface Stats {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  totalSpent: number
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguage] = useState("pl")
  const router = useRouter()

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "pl"
    setLanguage(savedLanguage)
  }, [])

  const { t } = useTranslation(language)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    // Mock data for demonstration
    setTimeout(() => {
      setOrders([
        {
          id: "1",
          title: t("analysis_type") === "Typ analizy" ? "Analiza raportu finansowego" : "Financial Report Analysis",
          status: "completed",
          createdAt: "2024-01-15T10:30:00Z",
          documentsCount: 3,
          price: 29.99,
        },
        {
          id: "2",
          title: t("analysis_type") === "Typ analizy" ? "Przegląd umowy prawnej" : "Legal Contract Review",
          status: "processing",
          createdAt: "2024-01-14T14:20:00Z",
          documentsCount: 5,
          price: 49.99,
        },
        {
          id: "3",
          title: t("analysis_type") === "Typ analizy" ? "Dokumenty badań rynku" : "Market Research Documents",
          status: "pending",
          createdAt: "2024-01-13T09:15:00Z",
          documentsCount: 2,
          price: 19.99,
        },
      ])

      setStats({
        totalOrders: 12,
        completedOrders: 8,
        pendingOrders: 4,
        totalSpent: 299.88,
      })

      setIsLoading(false)
    }, 1000)
  }, [router, t])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return t("completed")
      case "processing":
        return t("processing")
      case "pending":
        return t("pending")
      case "failed":
        return t("failed")
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DocAnalyzer</span>
          </div>
          <nav className="flex items-center space-x-4">
            <LanguageSelector onLanguageChange={setLanguage} />
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {t("settings")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem("token")
                router.push("/")
              }}
            >
              {t("logout")}
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("total_orders")}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">+2 {t("from_last_month")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("completed")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.completedOrders / stats.totalOrders) * 100)}% {t("completion_rate")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("pending")}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">{t("in_queue")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("total_spent")}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpent}</div>
              <p className="text-xs text-muted-foreground">{t("this_month")}: $79.97</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("recent_orders")}</CardTitle>
                  <CardDescription>{t("latest_orders")}</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/orders/new">
                    <Upload className="h-4 w-4 mr-2" />
                    {t("new_order")}
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="font-medium">{order.title}</h3>
                          <p className="text-sm text-gray-600">
                            {order.documentsCount} {t("documents")} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        <span className="font-medium">${order.price}</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>{t("view")}</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("quick_actions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" asChild>
                  <Link href="/orders/new">
                    <Upload className="h-4 w-4 mr-2" />
                    {t("upload_documents")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/orders">
                    <FileText className="h-4 w-4 mr-2" />
                    {t("view_all_orders")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/billing">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t("billing_usage")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("usage_this_month")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{t("documents_processed")}</span>
                      <span>23/100</span>
                    </div>
                    <Progress value={23} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{t("storage_used")}</span>
                      <span>1.2GB/5GB</span>
                    </div>
                    <Progress value={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
