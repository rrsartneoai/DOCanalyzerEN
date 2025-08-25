import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Database } from "./database.types"

export async function getSession() {
  const supabase = createServerComponentClient<Database>({ cookies })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getUser() {
  const supabase = createServerComponentClient<Database>({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }
  return session
}

export async function signOut() {
  const supabase = createServerComponentClient<Database>({ cookies })
  await supabase.auth.signOut()
  redirect("/auth/login")
}
