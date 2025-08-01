import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { validateFileType, extractTextFromFile } from "@/lib/document-processor"
import { analyzeDocument } from "@/lib/openai"
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

    // Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.userId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 })
    }

    const uploadedDocuments = []
    const analysisResults = []

    for (const file of files) {
      // Validate file type
      if (!validateFileType(file.type)) {
        continue // Skip unsupported files
      }

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`
      const storagePath = `documents/${user.userId}/${order.id}/${filename}`

      // Save document record to database
      const { data: document, error: docError } = await supabase
        .from("documents")
        .insert({
          order_id: order.id,
          filename,
          original_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: storagePath,
        })
        .select()
        .single()

      if (docError) {
        console.error("Document save error:", docError)
        continue
      }

      uploadedDocuments.push(document)

      // Extract text and analyze document
      try {
        const extractedText = await extractTextFromFile(buffer, file.name, file.type)

        // Perform AI analysis
        const analysisResult = await analyzeDocument(extractedText, order.analysis_type, file.name)

        // Save analysis results
        const { data: analysis, error: analysisError } = await supabase
          .from("analyses")
          .insert({
            order_id: order.id,
            analysis_type: order.analysis_type,
            results: analysisResult,
            confidence_score: analysisResult.confidenceScore,
          })
          .select()
          .single()

        if (!analysisError) {
          analysisResults.push(analysis)
        }
      } catch (error) {
        console.error("Analysis error:", error)
        // Continue with other files even if one fails
      }
    }

    // Update order status to processing
    await supabase
      .from("orders")
      .update({
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)

    // If all documents are processed, mark as completed
    if (uploadedDocuments.length > 0) {
      setTimeout(async () => {
        await supabase
          .from("orders")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id)
      }, 5000) // Simulate processing time
    }

    return NextResponse.json({
      message: "Files uploaded and processing started",
      documents: uploadedDocuments,
      analyses: analysisResults,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Configure API route for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}
