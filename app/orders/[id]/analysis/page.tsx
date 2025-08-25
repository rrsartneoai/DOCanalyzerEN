"use client"

import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getDictionary } from "@/lib/i18n"
import { analyzeDocument } from "@/lib/document-processor"
import { Loader2Icon } from "lucide-react"

interface AnalysisPageProps {
  params: {
    id: string
  }
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { id: orderId } = params
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  const dict = getDictionary("en") // Or dynamically get locale

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (orderError || !order) {
    console.error("Error fetching order:", orderError)
    return <div className="p-4 text-center text-destructive">{dict.orders.orderNotFound}</div>
  }

  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("*")
    .eq("order_id", order.id)
    .order("uploaded_at", { ascending: true })

  if (documentsError) {
    console.error("Error fetching documents:", documentsError)
    return <div className="p-4 text-center text-destructive">{dict.common.error}</div>
  }

  const documentToAnalyze = documents[0] // For simplicity, analyze the first document

  let analysisResult = documentToAnalyze?.analysis_result as ReturnType<typeof analyzeDocument> extends Promise<infer T>
    ? T
    : any

  // If analysis is pending or not started, trigger it
  if (
    documentToAnalyze &&
    (documentToAnalyze.analysis_status === "pending" || documentToAnalyze.analysis_status === "analyzing")
  ) {
    // In a real application, this would be triggered by a server action or webhook
    // after the file is fully processed and ready for AI.
    // For this example, we'll simulate a direct analysis if not already completed.
    // NOTE: This is a simplified client-side trigger. For large files or complex analysis,
    // you'd want a background job/server action.
    console.log(`Triggering analysis for document: ${documentToAnalyze.file_name}`)
    // Simulate fetching content (in a real app, you'd fetch from storage)
    const dummyContent = `This is a sample document about the importance of renewable energy. Key topics include solar power, wind energy, and sustainable practices. The sentiment is overwhelmingly positive, highlighting the benefits for the environment and economy. Dates mentioned: 2023-01-15, 2024-03-20. Costs: $1200, $500.`

    // This is a server component, so we can directly call analyzeDocument
    // However, if the analysis is long-running, you'd want to update status via a database
    // and revalidatePath. For this demo, we'll just show the result if available.
    if (documentToAnalyze.analysis_status === "pending") {
      // Update status to 'analyzing' in DB (not shown here for brevity)
      // await supabase.from('documents').update({ analysis_status: 'analyzing' }).eq('id', documentToAnalyze.id);
    }

    // Perform analysis (this will run on the server)
    const result = await analyzeDocument(dummyContent, { model: "openai" }) // Or 'gemini'
    analysisResult = result

    // Update analysis_result and analysis_status in DB (not shown here for brevity)
    // await supabase.from('documents').update({ analysis_status: 'completed', analysis_result: result }).eq('id', documentToAnalyze.id);
    // revalidatePath(`/orders/${orderId}/analysis`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{dict.orders.documentAnalysis}</CardTitle>
            <CardDescription>
              {documentToAnalyze
                ? `Analysis for: ${documentToAnalyze.file_name}`
                : "No document selected for analysis."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!documentToAnalyze ? (
              <div className="text-center text-muted-foreground p-4">
                <p>{dict.orders.noDocuments}</p>
                <Button className="mt-4" onClick={() => redirect(`/orders/${orderId}/upload`)}>
                  {dict.orders.uploadDocument}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{dict.common.analysisStatus}:</p>
                  <Badge
                    className={
                      documentToAnalyze.analysis_status === "completed"
                        ? "bg-green-500"
                        : documentToAnalyze.analysis_status === "analyzing"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }
                  >
                    {documentToAnalyze.analysis_status}
                    {documentToAnalyze.analysis_status === "analyzing" && (
                      <Loader2Icon className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </Badge>
                </div>

                {analysisResult?.summary && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <Textarea value={analysisResult.summary} readOnly rows={5} className="resize-none" />
                  </div>
                )}

                {analysisResult?.keywords && analysisResult.keywords.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult?.sentiment && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Sentiment</h3>
                    <Badge
                      className={
                        analysisResult.sentiment.toLowerCase().includes("positive")
                          ? "bg-green-500"
                          : analysisResult.sentiment.toLowerCase().includes("negative")
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }
                    >
                      {analysisResult.sentiment}
                    </Badge>
                  </div>
                )}

                {analysisResult?.extractedData && Object.keys(analysisResult.extractedData).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Extracted Data</h3>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(analysisResult.extractedData, null, 2)}
                    </pre>
                  </div>
                )}

                {analysisResult?.rawResponse && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Raw AI Response</h3>
                    <Textarea
                      value={analysisResult.rawResponse}
                      readOnly
                      rows={10}
                      className="resize-none font-mono text-xs"
                    />
                  </div>
                )}

                {!analysisResult?.summary && documentToAnalyze.analysis_status === "completed" && (
                  <div className="text-center text-muted-foreground p-4">
                    <p>No analysis results available for this document.</p>
                  </div>
                )}

                {documentToAnalyze.analysis_status === "pending" ||
                  (documentToAnalyze.analysis_status === "analyzing" && (
                    <div className="text-center text-muted-foreground p-4">
                      <Loader2Icon className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>{dict.orders.analyzingDocument}</p>
                    </div>
                  ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
