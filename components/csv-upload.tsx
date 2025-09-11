"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { parseCSV } from "@/lib/csv-parser"
import { useMerchants } from "@/contexts/merchant-context"

export function CSVUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null
    message: string
    rowCount?: number
  }>({ type: null, message: "" })
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setMerchants, merchants } = useMerchants()

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadStatus({
        type: "error",
        message: "Please select a CSV file",
      })
      return
    }

    setIsUploading(true)
    setUploadStatus({ type: null, message: "" })

    try {
      const result = await parseCSV(file)

      if (result.success && result.data) {
        setMerchants(result.data)
        setUploadStatus({
          type: "success",
          message: `Successfully uploaded ${result.rowCount} merchants`,
          rowCount: result.rowCount,
        })
      } else {
        setUploadStatus({
          type: "error",
          message: result.error || "Failed to parse CSV file",
        })
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const clearData = () => {
    setMerchants([])
    setUploadStatus({ type: null, message: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      {merchants.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Data loaded: {merchants.length} merchants</span>
            <Button variant="outline" size="sm" onClick={clearData}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div
        className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        } flex flex-col items-center justify-center`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-lg font-medium text-gray-900">Processing CSV...</p>
            <Progress value={50} className="w-full max-w-xs mx-auto" />
          </div>
        ) : (
          <>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Drop CSV File Here</p>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              Choose File
            </Button>
          </>
        )}
      </div>

      {uploadStatus.type && (
        <Alert variant={uploadStatus.type === "error" ? "destructive" : "default"} className="mt-4">
          {uploadStatus.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{uploadStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* Accordion for Required Columns */}
      <div className="mt-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="required-columns">
            <AccordionTrigger className="text-foreground">Lihat Kolom CSV yang Dibutuhkan</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>• mid_new</span>
                <span>• merchantofficialname</span>
                <span>• alamat</span>
                <span>• segmen</span>
                <span>• Area</span>
                <span>• Tgl Pasang EDC</span>
                <span>• Jml EDC</span>
                <span>• Trx W33'25</span>
                <span>• SV W33'25</span>
                <span>• YtD Trx W33 25</span>
                <span>• YtD SV W33 25</span>
                <span>• %YoY Trx</span>
                <span>• %YoY SV</span>
                <span>• MDFG W33'25</span>
                <span>• Growth YoY</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  )
}
