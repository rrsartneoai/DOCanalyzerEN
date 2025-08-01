import pdfParse from "pdf-parse"
import mammoth from "mammoth"
import * as XLSX from "xlsx"

export async function extractTextFromFile(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === "application/pdf") {
      const data = await pdfParse(buffer)
      return data.text
    }

    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    }

    if (
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    ) {
      const workbook = XLSX.read(buffer, { type: "buffer" })
      let text = ""

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName]
        const sheetText = XLSX.utils.sheet_to_txt(sheet)
        text += `Sheet: ${sheetName}\n${sheetText}\n\n`
      })

      return text
    }

    if (mimeType.startsWith("text/")) {
      return buffer.toString("utf-8")
    }

    throw new Error(`Unsupported file type: ${mimeType}`)
  } catch (error) {
    console.error("Text extraction error:", error)
    throw new Error(`Failed to extract text from ${filename}`)
  }
}

export function validateFileType(mimeType: string): boolean {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
    "text/plain",
    "text/csv",
  ]

  return allowedTypes.includes(mimeType)
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || ""
}
