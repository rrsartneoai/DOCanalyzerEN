"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  ArrowLeft,
  Brain,
  Target,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"

interface AnalysisData {
  orderId: string
  title: string
  analysisType: string
  status: string
  documents: Array<{
    id: string
    original_name: string
    file_size: number
    file_type: string
  }>
  analyses: Array<{
    id: string
    results: {
      summary: string
      keyPoints: string[]
      sentiment?: string
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
    confidence_score: number
    created_at: string
  }>
  summary: {
    totalDocuments: number
    averageConfidence: number
    completedAt: string | null
  }
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/auth/login"
          return
        }

        const response = await fetch(`/api/orders/${params.id}/analysis`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (response.ok) {
          setAnalysisData(data.analysis)
        } else {
          setError(data.message || "Failed to fetch analysis")
        }
      } catch (err) {
        setError("Network error. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()

    // Poll for updates if analysis is still processing
    const interval = setInterval(() => {
      if (analysisData?.status === "processing") {
        fetchAnalysis()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [params.id, analysisData?.status])

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-100"
      case "negative":
        return "text-red-600 bg-red-100"
      case "neutral":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    )
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error || "Analysis not found"}</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const combinedResults = analysisData.analyses.reduce(
    (acc, analysis) => {
      const results = analysis.results
      return {
        summary: acc.summary + "\n\n" + results.summary,
        keyPoints: [...acc.keyPoints, ...results.keyPoints],
        entities: [...(acc.entities || []), ...(results.entities || [])],
        financialData: [...(acc.financialData || []), ...(results.financialData || [])],
        riskFactors: [...(acc.riskFactors || []), ...(results.riskFactors || [])],
        recommendations: [...(acc.recommendations || []), ...(results.recommendations || [])],
        sentiment: results.sentiment || acc.sentiment,
        confidenceScore: Math.max(acc.confidenceScore, results.confidenceScore),
      }
    },
    {
      summary: "",
      keyPoints: [] as string[],
      entities: [] as any[],
      financialData: [] as any[],
      riskFactors: [] as string[],
      recommendations: [] as string[],
      sentiment: "neutral",
      confidenceScore: 0,
    },
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{analysisData.title}</h1>
              <p className="text-sm text-gray-600">Analysis Results • {analysisData.analysisType.replace("-", " ")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              className={
                analysisData.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : analysisData.status === "processing"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
              }
            >
              {analysisData.status}
            </Badge>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Status Alert */}
        {analysisData.status === "processing" && (
          <Alert className="mb-6">
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Analysis is still in progress. Results will update automatically as documents are processed.
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisData.summary.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">Files analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confidence</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getConfidenceColor(analysisData.summary.averageConfidence)}`}>
                {Math.round(analysisData.summary.averageConfidence * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Average confidence</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Key Points</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{combinedResults.keyPoints.length}</div>
              <p className="text-xs text-muted-foreground">Insights found</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className={getSentimentColor(combinedResults.sentiment)}>
                {combinedResults.sentiment || "Neutral"}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Overall tone</p>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="insights">Key Insights</TabsTrigger>
            <TabsTrigger value="data">Data Points</TabsTrigger>
            <TabsTrigger value="risks">Risk Factors</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>Comprehensive overview of your document analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{combinedResults.summary.trim()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisData.documents.map((doc, index) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.original_name}</p>
                          <p className="text-sm text-gray-600">
                            {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.file_type}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Analyzed
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Important findings and observations from your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {combinedResults.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {combinedResults.entities && combinedResults.entities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Entities Identified</CardTitle>
                  <CardDescription>Key entities, names, and concepts found in your documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {combinedResults.entities.map((entity, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{entity.text}</span>
                          <Badge variant="outline">{entity.type}</Badge>
                        </div>
                        <Progress value={entity.confidence * 100} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">{Math.round(entity.confidence * 100)}% confidence</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {combinedResults.financialData && combinedResults.financialData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Data</CardTitle>
                  <CardDescription>Key financial metrics and data points extracted from your documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {combinedResults.financialData.map((data, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{data.metric}</h4>
                          <span className="text-lg font-bold text-green-600">{data.value}</span>
                        </div>
                        <p className="text-sm text-gray-600">{data.context}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No specific data points were extracted from your documents.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This may be normal depending on your document type and analysis method.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            {combinedResults.riskFactors && combinedResults.riskFactors.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Risk Factors</CardTitle>
                  <CardDescription>Potential risks and concerns identified in your documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {combinedResults.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <p className="text-gray-700">{risk}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-600">No significant risk factors were identified.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Your documents appear to be free of major concerns based on the analysis performed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {combinedResults.recommendations && combinedResults.recommendations.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Actionable recommendations based on the analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {combinedResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <p className="text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No specific recommendations were generated.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      The analysis may not have identified areas requiring specific action items.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
