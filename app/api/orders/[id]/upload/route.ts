import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { analyzeDocument } from "@/lib/gemini"
import { extractTextFromFile } from "@/lib/document-processor"
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.userId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Get user language preference
    const { data: userData } = await supabase.from("users").select("language").eq("id", user.userId).single()

    const userLanguage = userData?.language || "pl"

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (files.length === 0) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 })
    }

    const uploadedDocuments = []
    const analysisResults = []

    // Process each file
    for (const file of files) {
      try {
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Extract text from file
        const extractedText = await extractTextFromFile(buffer, file.name, file.type)

        // Store document in database
        const { data: document, error: docError } = await supabase
          .from("documents")
          .insert({
            order_id: params.id,
            original_name: file.name,
            file_size: file.size,
            file_type: file.type,
            extracted_text: extractedText,
            storage_path: `orders/${params.id}/${file.name}`, // You would store actual file here
          })
          .select()
          .single()

        if (docError) {
          console.error("Document storage error:", docError)
          continue
        }

        uploadedDocuments.push(document)

        // Analyze document with Gemini
        try {
          const analysisResult = await analyzeDocument(extractedText, order.analysis_type, file.name, userLanguage)

          // Store analysis results
          const { data: analysis, error: analysisError } = await supabase
            .from("analyses")
            .insert({
              order_id: params.id,
              document_id: document.id,
              results: analysisResult,
              confidence_score: analysisResult.confidenceScore || 0.8,
              processing_time: new Date().toISOString(),
            })
            .select()
            .single()

          if (!analysisError) {
            analysisResults.push(analysis)
          }
        } catch (analysisError) {
          console.error("Analysis error:", analysisError)
          // Continue with other files even if one analysis fails
        }
      } catch (fileError) {
        console.error("File processing error:", fileError)
        continue
      }
    }

    // Update order status
    await supabase
      .from("orders")
      .update({
        status: analysisResults.length > 0 ? "completed" : "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    return NextResponse.json({
      message: "Files uploaded and processed successfully",
      documents: uploadedDocuments,
      analyses: analysisResults,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
