import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: orders, error } = await supabase.from("orders").select("*")

  if (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const body = await req.json()
  const { data, error } = await supabase.from("orders").insert([body]).select().single()

  if (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
