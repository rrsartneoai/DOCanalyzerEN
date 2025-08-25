import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "@/lib/database.types"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const orderId = params.id

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
    }

    const fileExtension = file.name.split(".").pop()
    const filePath = `${orderId}/${uuidv4()}.${fileExtension}`

    const { data: uploadData, error: uploadError } = await supabase.storage.from("documents").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Error uploading file to Supabase Storage:", uploadError)
      return NextResponse.json({ error: "Failed to upload document." }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(filePath)

    const documentUrl = publicUrlData.publicUrl

    // Update the order with the document URL and status
    const { data, error } = await supabase
      .from("orders")
      .update({
        document_url: documentUrl,
        status: "uploaded",
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      console.error("Error updating order with document URL:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[DOCUMENT_UPLOAD_ERROR]", error)
    return NextResponse.json({ error: "Failed to process document upload." }, { status: 500 })
  }
}
