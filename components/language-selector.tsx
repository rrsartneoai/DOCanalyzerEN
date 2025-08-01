"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

interface LanguageSelectorProps {
  onLanguageChange: (language: string) => void
}

const languages = [
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
]

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("pl")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "pl"
    setSelectedLanguage(savedLanguage)
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode)
    localStorage.setItem("language", languageCode)
    onLanguageChange(languageCode)

    // Reload the page to apply language changes
    window.location.reload()
  }

  const currentLanguage = languages.find((lang) => lang.code === selectedLanguage) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={selectedLanguage === language.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
