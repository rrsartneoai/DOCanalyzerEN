import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { Database } from "@/lib/database.types"

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get("email"))
  const password = String(String(formData.get("password")))
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/register?error=Could not authenticate user`, {
      status: 301,
    })
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/register?message=Check email to continue sign in process`, {
    status: 301,
  })
}
