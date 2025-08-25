"use client"

import { useState } from "react"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { getDictionary } from "@/lib/i18n"

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState("en") // This would typically come from user preferences in DB
  const dict = getDictionary("en") // Or dynamically get locale

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
  }

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    // In a real app, you'd update user preferences in DB and potentially reload dictionary
    console.log(`Language changed to: ${newLang}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <header className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold">{dict.settings.title}</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </header>

      <main className="flex-1 py-6">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Manage your application preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">{dict.settings.darkMode}</Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => handleThemeChange(checked ? "dark" : "light")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme-select">{dict.settings.theme}</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{dict.settings.lightMode}</SelectItem>
                  <SelectItem value="dark">{dict.settings.darkMode}</SelectItem>
                  <SelectItem value="system">{dict.settings.systemTheme}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language-select">{dict.settings.language}</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language-select">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  {/* Add more languages as supported */}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" disabled>
              Save Settings (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
