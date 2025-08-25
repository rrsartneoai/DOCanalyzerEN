"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { FileUpIcon, Loader2Icon, CheckCircleIcon } from "lucide-react"
import { getDictionary } from "@/lib/i18n"

interface UploadPageProps {
  params: {
    id: string
  }
}

export default function UploadPage({ params }: UploadPageProps) {
  const { id: orderId } = params
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const dict = getDictionary("en") // Or dynamically get locale

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0])
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a document to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("orderId", orderId)

    try {
      const response = await fetch(`/api/orders/${orderId}/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload document.")
      }

      toast({
        title: dict.orders.uploadSuccess,
        description: `Document "${selectedFile.name}" uploaded successfully.`,
      })
      router.push(`/orders/${orderId}`) // Redirect back to order details
    } catch (error: any) {
      console.error("Error uploading document:", error)
      toast({
        title: dict.orders.uploadFailed,
        description: error.message || dict.common.error,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{dict.orders.uploadDocument}</CardTitle>
          <CardDescription>{dict.orders.dragAndDrop}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              {selectedFile ? (
                <div className="text-center">
                  <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
              ) : (
                <>
                  <FileUpIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">{dict.orders.dragAndDrop.split(",")[0]}</span>{" "}
                    {dict.orders.dragAndDrop.split(",")[1]}
                  </p>
                  <p className="text-xs text-muted-foreground">{dict.orders.supportedFormats}</p>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer mt-4">
                    <Button variant="outline" size="sm">
                      {dict.orders.selectFile}
                    </Button>
                  </label>
                </>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  {dict.orders.processingFile}
                </>
              ) : (
                dict.common.upload
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
