import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateTextWithOpenAI(prompt: string) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. OpenAI API calls will not work.")
    return "OpenAI API key not configured."
  }
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  })
  return chatCompletion.choices[0].message.content
}
