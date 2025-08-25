import { createClient } from "@supabase/supabase-js"
import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types" // Assuming you have this type definition

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error("Supabase environment variables are not fully set.")
  // In a real app, you might throw an error or handle this more gracefully
}

// Client-side Supabase client (for use in browser components)
// Use a singleton pattern to avoid creating multiple clients
let clientSideSupabase: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!clientSideSupabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL or Anon Key is missing for client-side client.")
    }
    clientSideSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return clientSideSupabase
}

// Server-side Supabase client (for use in Server Components, Route Handlers, Server Actions)
export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing for server-side client.")
  }

  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Action or Route Handler
          // This error is expected if you're trying to set cookies in a Server Component
          console.warn("Could not set cookie from Server Component:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          console.warn("Could not remove cookie from Server Component:", error)
        }
      },
    },
  })
}

// Supabase Admin client (for use in server-side contexts requiring service role key, e.g., webhooks)
export function getSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase URL or Service Role Key is missing for admin client.")
  }
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Type definitions for your database schema (example)
// You would typically generate this using `supabase gen types typescript --schema public > lib/database.types.ts`
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
