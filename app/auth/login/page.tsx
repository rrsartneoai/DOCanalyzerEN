"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { LanguageSelector } from "@/components/language-selector"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [language, setLanguage] = useState("pl")
  const router = useRouter()

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "pl"
    setLanguage(savedLanguage)
  }, [])

  const { t } = useTranslation(language)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        router.push("/dashboard")
      } else {
        setError(data.message || t("login_failed"))
      }
    } catch (err) {
      setError(t("network_error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
            <LanguageSelector onLanguageChange={setLanguage} />
          </div>
          <CardTitle className="text-2xl">{t("welcome_back")}</CardTitle>
          <CardDescription>{t("sign_in_account")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                {t("forgot_password")}
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("signing_in") : t("sign_in")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t("dont_have_account")}{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                {t("sign_up")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
