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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get order with analyses and documents
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        documents(*),
        analyses(*)
      `)
      .eq("id", params.id)
      .eq("user_id", user.userId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Combine all analysis results
    const combinedAnalysis = {
      orderId: order.id,
      title: order.title,
      analysisType: order.analysis_type,
      status: order.status,
      documents: order.documents,
      analyses: order.analyses,
      summary: {
        totalDocuments: order.documents?.length || 0,
        averageConfidence:
          order.analyses?.length > 0
            ? order.analyses.reduce((sum: number, analysis: any) => sum + (analysis.confidence_score || 0), 0) /
              order.analyses.length
            : 0,
        completedAt: order.status === "completed" ? order.updated_at : null,
      },
    }

    return NextResponse.json({
      analysis: combinedAnalysis,
    })
  } catch (error) {
    console.error("Get analysis error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
