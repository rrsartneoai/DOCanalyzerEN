"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { LanguageSelector } from "@/components/language-selector"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [language, setLanguage] = useState("pl")
  const router = useRouter()

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "pl"
    setLanguage(savedLanguage)
  }, [])

  const { t } = useTranslation(language)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwords_not_match"))
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError(t("agree_terms_required"))
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          company: formData.company,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        router.push("/dashboard")
      } else {
        setError(data.message || t("registration_failed"))
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
          <CardTitle className="text-2xl">{t("create_account")}</CardTitle>
          <CardDescription>{t("join_docanalyzer")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("first_name")}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder={t("first_name")}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("last_name")}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder={t("last_name")}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("email")}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">{t("company")}</Label>
              <Input
                id="company"
                name="company"
                placeholder={t("company")}
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password")}
                  value={formData.password}
                  onChange={handleInputChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirm_password")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("confirm_password")}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
              />
              <Label htmlFor="terms" className="text-sm">
                {t("agree_terms")}{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  {t("terms_service")}
                </Link>{" "}
                {t("privacy_policy").toLowerCase()}{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  {t("privacy_policy")}
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("creating_account") : t("create_account")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t("already_have_account")}{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                {t("sign_in")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
