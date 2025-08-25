import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generateTextWithGemini(prompt: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Gemini API calls will not work.")
    return "Gemini API key not configured."
  }
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export async function generateTextWithGeminiVision(
  prompt: string,
  imageParts: { inlineData: { data: string; mimeType: string } }[],
): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Gemini AI is not initialized. GEMINI_API_KEY is missing.")
    return null
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })
    const result = await model.generateContent([prompt, ...imageParts])
    const response = await result.response
    const text = response.text()
    return text
  } catch (error) {
    console.error("Error generating text with Gemini Vision:", error)
    return null
  }
}
