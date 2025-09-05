"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, FileSpreadsheet, FileImage, CheckCircle } from "lucide-react"
import { useMerchants } from "@/contexts/merchant-context"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"

export function ExportReports() {
  const { merchants, stats } = useMerchants()
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null)
  const [exportStatus, setExportStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const handleExportExcel = async () => {
    setIsExporting("excel")
    setExportStatus({ type: null, message: "" })

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate processing time
      exportToExcel(merchants, stats)
      setExportStatus({
        type: "success",
        message: `Successfully exported ${merchants.length} merchants to Excel`,
      })
    } catch (error) {
      setExportStatus({
        type: "error",
        message: `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsExporting(null)
    }
  }

  const handleExportPDF = async () => {
    setIsExporting("pdf")
    setExportStatus({ type: null, message: "" })

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate processing time
      exportToPDF(merchants, stats)
      setExportStatus({
        type: "success",
        message: `Successfully exported ${merchants.length} merchants to PDF`,
      })
    } catch (error) {
      setExportStatus({
        type: "error",
        message: `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsExporting(null)
    }
  }

  const hasData = merchants.length > 0

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Status */}
          {exportStatus.type && (
            <Alert variant={exportStatus.type === "error" ? "destructive" : "default"}>
              {exportStatus.type === "success" ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              <AlertDescription>{exportStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exporting to {isExporting === "excel" ? "Excel" : "PDF"}...</span>
                <span>Processing data</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          )}

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Excel Export */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Excel Export</h3>
                  <p className="text-sm text-gray-600">Complete data with multiple sheets</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full merchant data</li>
                <li>• Summary statistics</li>
                <li>• Segment distribution</li>
                <li>• EDC data by area</li>
              </ul>
              <Button
                onClick={handleExportExcel}
                disabled={!hasData || isExporting === "excel"}
                className="w-full bg-transparent"
                variant="outline"
              >
                {isExporting === "excel" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                  </>
                )}
              </Button>
            </div>

            {/* PDF Export */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <FileImage className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="font-semibold">PDF Report</h3>
                  <p className="text-sm text-gray-600">Formatted report with charts</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Executive summary</li>
                <li>• Key statistics</li>
                <li>• Visual charts</li>
                <li>• Top merchant data</li>
              </ul>
              <Button
                onClick={handleExportPDF}
                disabled={!hasData || isExporting === "pdf"}
                className="w-full bg-transparent"
                variant="outline"
              >
                {isExporting === "pdf" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export to PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Data Summary */}
          {hasData ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Export Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-800">{stats.totalMerchants}</div>
                  <div className="text-blue-600">Total Merchants</div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">{stats.withEDC}</div>
                  <div className="text-blue-600">With EDC</div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">{Object.keys(stats.segmentDistribution).length}</div>
                  <div className="text-blue-600">Segments</div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">{stats.edcByBranch ? Object.keys(stats.edcByBranch).length : 0}</div>
                  <div className="text-blue-600">Areas</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Data Available</p>
              <p className="text-sm">Upload merchant data to enable export functionality</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
