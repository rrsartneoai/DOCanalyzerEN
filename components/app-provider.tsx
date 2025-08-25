"use client"

import * as React from "react"
import { SessionProvider } from "@supabase/auth-helpers-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types" // Assuming you have this type definition
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster" // Ensure this is imported from shadcn/ui

const queryClient = new QueryClient()

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClientComponentClient<Database>(), [])

  return (
    <SessionProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster /> {/* Ensure Toaster is rendered here or in layout.tsx */}
      </QueryClientProvider>
    </SessionProvider>
  )
}
