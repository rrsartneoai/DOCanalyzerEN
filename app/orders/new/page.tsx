"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, X, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "uploaded" | "error"
  progress: number
}

export default function NewOrderPage() {
  const [orderData, setOrderData] = useState({
    title: "",
    description: "",
    analysisType: "",
    priority: "standard",
  })
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const analysisTypes = [
    { value: "content-analysis", label: "Content Analysis", price: 19.99 },
    { value: "financial-review", label: "Financial Review", price: 29.99 },
    { value: "legal-compliance", label: "Legal Compliance", price: 39.99 },
    { value: "data-extraction", label: "Data Extraction", price: 24.99 },
    { value: "sentiment-analysis", label: "Sentiment Analysis", price: 19.99 },
    { value: "custom-analysis", label: "Custom Analysis", price: 49.99 },
  ]

  const handleInputChange = (field: string, value: string) => {
    setOrderData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Simulate file upload
    newFiles.forEach((file) => {
      simulateUpload(file.id)
    })
  }

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + Math.random() * 30, 100)
            const newStatus = newProgress === 100 ? "uploaded" : "uploading"
            return { ...file, progress: newProgress, status: newStatus }
          }
          return file
        }),
      )
    }, 500)

    setTimeout(() => {
      clearInterval(interval)
      setFiles((prev) =>
        prev.map((file) => (file.id === fileId ? { ...file, progress: 100, status: "uploaded" } : file)),
      )
    }, 3000)
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const calculateTotalPrice = () => {
    const selectedAnalysis = analysisTypes.find((type) => type.value === orderData.analysisType)
    const basePrice = selectedAnalysis?.price || 0
    const fileMultiplier = Math.max(1, files.length)
    const priorityMultiplier = orderData.priority === "urgent" ? 1.5 : 1
    return (basePrice * fileMultiplier * priorityMultiplier).toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!orderData.title || !orderData.analysisType || files.length === 0) {
      setError("Please fill in all required fields and upload at least one file")
      setIsSubmitting(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to order confirmation
      router.push("/orders/confirmation")
    } catch (err) {
      setError("Failed to create order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Create New Order</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Provide basic information about your analysis request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Order Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Q4 Financial Report Analysis"
                    value={orderData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide additional context or specific requirements for the analysis..."
                    value={orderData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="analysisType">Analysis Type *</Label>
                    <Select
                      value={orderData.analysisType}
                      onValueChange={(value) => handleInputChange("analysisType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select analysis type" />
                      </SelectTrigger>
                      <SelectContent>
                        {analysisTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} - ${type.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={orderData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                        <SelectItem value="urgent">Urgent (+50% fee, 1-2 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Upload the documents you want to analyze. Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-gray-600 mb-4">Maximum file size: 50MB per file</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Select Files
                    </label>
                  </Button>
                </div>

                {/* Uploaded Files */}
                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="font-medium">Uploaded Files ({files.length})</h3>
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                            {file.status === "uploading" && <Progress value={file.progress} className="mt-1" />}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === "uploaded" && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {file.status === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Analysis Type:</span>
                    <span className="font-medium">
                      {analysisTypes.find((type) => type.value === orderData.analysisType)?.label || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Files:</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority:</span>
                    <span className="font-medium capitalize">{orderData.priority}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Price:</span>
                      <span>${calculateTotalPrice()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting || files.length === 0}>
                {isSubmitting ? "Creating Order..." : `Create Order - $${calculateTotalPrice()}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
