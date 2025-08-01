import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get user's orders with document count
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        documents(count),
        analyses(*)
      `)
      .eq("user_id", user.userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json({
      orders: orders || [],
      total: orders?.length || 0,
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, description, analysisType, priority, price } = await request.json()

    // Validate input
    if (!title || !analysisType || !price) {
      return NextResponse.json({ message: "Title, analysis type, and price are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Create order in database
    const { data: newOrder, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.userId,
        title,
        description: description || null,
        analysis_type: analysisType,
        priority: priority || "standard",
        price: Math.round(price * 100), // Convert to cents
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ message: "Failed to create order" }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: newOrder,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
