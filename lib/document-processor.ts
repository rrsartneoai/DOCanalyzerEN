import { generateChatCompletionWithOpenAI } from "./openai"
import { generateTextWithGemini, generateTextWithGeminiVision } from "./gemini"
import type OpenAI from "openai"

export type AnalysisResult = {
  summary: string | null
  keywords: string[] | null
  sentiment: string | null
  extractedData: Record<string, any> | null
  rawResponse: string | null
  modelUsed: "openai" | "gemini" | "gemini-vision" | "none"
}

// Helper to convert file to base64 for Gemini Vision
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1]
      resolve(base64String)
    }
    reader.onerror = (error) => reject(error)
  })
}

export async function analyzeDocument(
  documentContent: string | File, // Can be text content or a File object
  options?: {
    model?: "openai" | "gemini" | "gemini-vision"
    prompt?: string
  },
): Promise<AnalysisResult> {
  const defaultPrompt = `Analyze the following document content. Provide a concise summary, extract key keywords (comma-separated), determine the overall sentiment (positive, neutral, negative), and identify any structured data like names, dates, or amounts. Format the output as a JSON object with keys: summary, keywords, sentiment, extractedData.`

  const modelToUse = options?.model || "openai" // Default to OpenAI
  const analysisPrompt = options?.prompt || defaultPrompt

  let rawResponse: string | null = null
  let modelUsed: AnalysisResult["modelUsed"] = "none"

  try {
    if (modelToUse === "openai") {
      modelUsed = "openai"
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: analysisPrompt },
        {
          role: "user",
          content: typeof documentContent === "string" ? documentContent : `Document file: ${documentContent.name}`,
        },
      ]
      rawResponse = await generateChatCompletionWithOpenAI(messages)
    } else if (modelToUse === "gemini") {
      modelUsed = "gemini"
      rawResponse = await generateTextWithGemini(`${analysisPrompt}\n\nDocument: ${documentContent}`)
    } else if (modelToUse === "gemini-vision" && documentContent instanceof File) {
      modelUsed = "gemini-vision"
      const base64Image = await fileToBase64(documentContent)
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: documentContent.type,
        },
      }
      rawResponse = await generateTextWithGeminiVision(analysisPrompt, [imagePart])
    } else if (modelToUse === "gemini-vision" && typeof documentContent === "string") {
      console.warn("Gemini Vision model requires a File object for image analysis. Falling back to Gemini text model.")
      modelUsed = "gemini"
      rawResponse = await generateTextWithGemini(`${analysisPrompt}\n\nDocument: ${documentContent}`)
    }

    let summary: string | null = null
    let keywords: string[] | null = null
    let sentiment: string | null = null
    let extractedData: Record<string, any> | null = null

    if (rawResponse) {
      try {
        // Attempt to parse as JSON
        const parsedResult = JSON.parse(rawResponse)
        summary = parsedResult.summary || null
        keywords = parsedResult.keywords
          ? Array.isArray(parsedResult.keywords)
            ? parsedResult.keywords
            : parsedResult.keywords.split(",").map((k: string) => k.trim())
          : null
        sentiment = parsedResult.sentiment || null
        extractedData = parsedResult.extractedData || null
      } catch (jsonError) {
        // If not JSON, treat the whole response as summary
        summary = rawResponse
        console.warn("AI response was not valid JSON. Treating as plain text summary.", jsonError)
      }
    }

    return {
      summary,
      keywords,
      sentiment,
      extractedData,
      rawResponse,
      modelUsed,
    }
  } catch (error) {
    console.error("Error during document analysis:", error)
    return {
      summary: null,
      keywords: null,
      sentiment: null,
      extractedData: null,
      rawResponse: null,
      modelUsed: "none",
    }
  }
}
