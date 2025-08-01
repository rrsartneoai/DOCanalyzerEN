import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export const ANALYSIS_TYPES = {
  "content-analysis": {
    name: "Content Analysis",
    price: 1999, // $19.99 in cents
    description: "Extract and analyze text content, structure, and key information",
  },
  "financial-review": {
    name: "Financial Review",
    price: 2999, // $29.99 in cents
    description: "Analyze financial documents, extract numbers, and identify trends",
  },
  "legal-compliance": {
    name: "Legal Compliance",
    price: 3999, // $39.99 in cents
    description: "Review legal documents for compliance and risk assessment",
  },
  "data-extraction": {
    name: "Data Extraction",
    price: 2499, // $24.99 in cents
    description: "Extract structured data from unstructured documents",
  },
  "sentiment-analysis": {
    name: "Sentiment Analysis",
    price: 1999, // $19.99 in cents
    description: "Analyze sentiment and emotional tone in documents",
  },
  "custom-analysis": {
    name: "Custom Analysis",
    price: 4999, // $49.99 in cents
    description: "Custom analysis based on your specific requirements",
  },
} as const

export function calculateOrderPrice(
  analysisType: keyof typeof ANALYSIS_TYPES,
  fileCount: number,
  priority: "standard" | "urgent",
): number {
  const basePrice = ANALYSIS_TYPES[analysisType].price
  const fileMultiplier = Math.max(1, fileCount)
  const priorityMultiplier = priority === "urgent" ? 1.5 : 1

  return Math.round(basePrice * fileMultiplier * priorityMultiplier)
}
