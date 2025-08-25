import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { analyzeDocument } from "@/lib/document-processor"
import type { Database } from "@/lib/database.types"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const orderId = params.id

  try {
    // Fetch the document URL from the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("document_url")
      .eq("id", orderId)
      .single()

    if (orderError || !order?.document_url) {
      console.error("Error fetching document URL:", orderError)
      return NextResponse.json({ error: "Document not found for this order." }, { status: 404 })
    }

    // Perform document analysis
    const analysisResult = await analyzeDocument(order.document_url)

    // Update the order with the analysis result
    const { data, error } = await supabase
      .from("orders")
      .update({
        analysis_result: analysisResult,
        status: "analyzed",
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      console.error("Error updating order with analysis result:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[DOCUMENT_ANALYSIS_ERROR]", error)
    return NextResponse.json({ error: "Failed to perform document analysis." }, { status: 500 })
  }
}
