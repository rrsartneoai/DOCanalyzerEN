"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "uploaded" | "error"
  progress: number
}

interface Order {
  id: string
  title: string
  status: string
  analysis_type: string
}

export default function UploadPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        const response = await fetch(`/api/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (response.ok) {
          setOrder(data.order)
        } else {
          setError(data.message || "Failed to fetch order")
        }
      } catch (err) {
        setError("Network error. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [params.id, router])

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

  const handleFiles = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])
    setIsUploading(true)

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()

      fileList.forEach((file) => {
        formData.append("files", file)
      })

      // Upload files with progress tracking
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setFiles((prev) =>
            prev.map((file) => (newFiles.some((nf) => nf.name === file.name) ? { ...file, progress } : file)),
          )
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setFiles((prev) =>
            prev.map((file) =>
              newFiles.some((nf) => nf.name === file.name) ? { ...file, status: "uploaded", progress: 100 } : file,
            ),
          )

          // Redirect to analysis page after successful upload
          setTimeout(() => {
            router.push(`/orders/${params.id}/analysis`)
          }, 2000)
        } else {
          setFiles((prev) =>
            prev.map((file) => (newFiles.some((nf) => nf.name === file.name) ? { ...file, status: "error" } : file)),
          )
          setError("Upload failed. Please try again.")
        }
        setIsUploading(false)
      })

      xhr.addEventListener("error", () => {
        setFiles((prev) =>
          prev.map((file) => (newFiles.some((nf) => nf.name === file.name) ? { ...file, status: "error" } : file)),
        )
        setError("Upload failed. Please try again.")
        setIsUploading(false)
      })

      xhr.open("POST", `/api/orders/${params.id}/upload`)
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      xhr.send(formData)
    } catch (err) {
      setError("Upload failed. Please try again.")
      setIsUploading(false)
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href={`/orders/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Upload Documents</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Order Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{order?.title}</CardTitle>
              <CardDescription>
                Analysis Type: {order?.analysis_type.replace("-", " ")} • Status: {order?.status}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Documents</CardTitle>
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
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <Button type="button" variant="outline" asChild disabled={isUploading}>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Status */}
              {isUploading && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-800">Uploading and processing documents...</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {files.some((f) => f.status === "uploaded") && !isUploading && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Documents uploaded successfully! Redirecting to analysis results...
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
