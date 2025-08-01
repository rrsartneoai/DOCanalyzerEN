import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface DocumentAnalysisResult {
  summary: string
  keyPoints: string[]
  sentiment?: "positive" | "negative" | "neutral"
  entities?: Array<{
    text: string
    type: string
    confidence: number
  }>
  financialData?: Array<{
    metric: string
    value: string
    context: string
  }>
  riskFactors?: string[]
  recommendations?: string[]
  confidenceScore: number
}

export async function analyzeDocument(
  content: string,
  analysisType: string,
  filename: string,
): Promise<DocumentAnalysisResult> {
  const prompts = {
    "content-analysis": `Analyze the following document content and provide:
1. A comprehensive summary
2. Key points and main topics
3. Important entities mentioned
4. Overall structure assessment

Document: ${filename}
Content: ${content}`,

    "financial-review": `Analyze this financial document and extract:
1. Key financial metrics and numbers
2. Trends and patterns
3. Risk factors
4. Financial health indicators
5. Recommendations

Document: ${filename}
Content: ${content}`,

    "legal-compliance": `Review this legal document for:
1. Compliance issues
2. Risk factors
3. Key legal terms and clauses
4. Recommendations for improvement
5. Potential concerns

Document: ${filename}
Content: ${content}`,

    "sentiment-analysis": `Analyze the sentiment and tone of this document:
1. Overall sentiment (positive/negative/neutral)
2. Emotional indicators
3. Tone analysis
4. Key phrases that indicate sentiment
5. Confidence in sentiment assessment

Document: ${filename}
Content: ${content}`,

    "data-extraction": `Extract structured data from this document:
1. Key data points and values
2. Dates, numbers, and measurements
3. Names, locations, and entities
4. Structured information
5. Data quality assessment

Document: ${filename}
Content: ${content}`,

    "custom-analysis": `Provide a comprehensive analysis of this document:
1. Document type and purpose
2. Key information and insights
3. Structure and organization
4. Important findings
5. Actionable recommendations

Document: ${filename}
Content: ${content}`,
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            'You are an expert document analyst. Provide detailed, accurate analysis in JSON format with the following structure: { "summary": string, "keyPoints": string[], "sentiment": string, "entities": array, "financialData": array, "riskFactors": string[], "recommendations": string[], "confidenceScore": number }',
        },
        {
          role: "user",
          content: prompts[analysisType as keyof typeof prompts] || prompts["content-analysis"],
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error("No analysis result received")
    }

    try {
      return JSON.parse(result)
    } catch {
      // Fallback if JSON parsing fails
      return {
        summary: result,
        keyPoints: [result.substring(0, 200) + "..."],
        confidenceScore: 0.8,
        recommendations: ["Review the full analysis for detailed insights"],
      }
    }
  } catch (error) {
    console.error("OpenAI analysis error:", error)
    throw new Error("Failed to analyze document")
  }
}
