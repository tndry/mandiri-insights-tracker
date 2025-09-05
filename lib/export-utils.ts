import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { MerchantData, MerchantStats } from "./types"

export function exportToExcel(merchants: MerchantData[], stats: MerchantStats) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Merchant Data Sheet
  const merchantSheet = XLSX.utils.json_to_sheet(
    merchants.map((merchant) => ({
      "MID New": merchant.mid_new,
      "Merchant Brand Name": merchant.merchantbrandname,
      PIC: merchant.PIC,
      "Official Name": merchant.merchantofficialname,
      "Common Name": merchant.commonname,
      Address: merchant.alamat,
      Phone: merchant.tephone,
      "Contact Person": merchant.contactperson,
      Segment: merchant.segmen,
      "Account Number": merchant.norekening,
      "Client Number": merchant.clifno,
      "LOB Description": merchant.lobdesc,
      LOB: merchant.LOB,
      "Open Date": merchant["Open Date"],
      "EDC Install Date": merchant["Tgl Pasang EDC"],
      "EDC Count": merchant["Jml EDC"],
      "Area Code": merchant.cd_cbg,
      "SV W25": merchant["SV W25 (14-20 Jun 25)"],
      "FY SV 24": merchant["FY SV 24"],
      "YtD SV W25 '25": merchant["YtD SV W25 '25"],
      "Has EDC": merchant["Tgl Pasang EDC"] && merchant["Tgl Pasang EDC"].trim() !== "" ? "Yes" : "No",
    })),
  )

  // Summary Statistics Sheet
  const summaryData = [
    ["Metric", "Value"],
    ["Total Merchants", stats.totalMerchants],
    ["Merchants with EDC", stats.withEDC],
    ["Merchants without EDC", stats.withoutEDC],
    ["EDC Installation Rate", `${((stats.withEDC / stats.totalMerchants) * 100).toFixed(1)}%`],
    ["", ""],
    ["Segment Distribution", ""],
    ...Object.entries(stats.segmentDistribution).map(([segment, count]) => [segment, count]),
    ["", ""],
    ["EDC Devices by Area", ""],
    ...Object.entries(stats.edcByArea).map(([area, count]) => [area, count]),
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)

  // Add sheets to workbook
  XLSX.utils.book_append_sheet(workbook, merchantSheet, "Merchant Data")
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary Statistics")

  // Generate filename with current date
  const date = new Date().toISOString().split("T")[0]
  const filename = `Bank_Mandiri_Merchant_Report_${date}.xlsx`

  // Save the file
  XLSX.writeFile(workbook, filename)
}

export function exportToPDF(merchants: MerchantData[], stats: MerchantStats) {
  const doc = new jsPDF()
  const date = new Date().toLocaleDateString("id-ID")

  // Header
  doc.setFontSize(20)
  doc.text("Bank Mandiri - Merchant Acquisition Report", 20, 20)
  doc.setFontSize(12)
  doc.text(`Generated on: ${date}`, 20, 30)

  // Summary Statistics
  doc.setFontSize(16)
  doc.text("Summary Statistics", 20, 50)

  const summaryData = [
    ["Total Merchants", stats.totalMerchants.toString()],
    ["Merchants with EDC", stats.withEDC.toString()],
    ["Merchants without EDC", stats.withoutEDC.toString()],
    ["EDC Installation Rate", `${((stats.withEDC / stats.totalMerchants) * 100).toFixed(1)}%`],
  ]

  autoTable(doc, {
    head: [["Metric", "Value"]],
    body: summaryData,
    startY: 60,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
  })

  // Segment Distribution
  const segmentData = Object.entries(stats.segmentDistribution).map(([segment, count]) => [
    segment,
    count.toString(),
    `${((count / stats.totalMerchants) * 100).toFixed(1)}%`,
  ])

  if (segmentData.length > 0) {
    doc.setFontSize(16)
    doc.text("Merchant Segments", 20, (doc as any).lastAutoTable.finalY + 20)

    autoTable(doc, {
      head: [["Segment", "Count", "Percentage"]],
      body: segmentData,
      startY: (doc as any).lastAutoTable.finalY + 30,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] },
    })
  }

  // EDC by Area (Top 10)
  const edcAreaData = Object.entries(stats.edcByArea)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([area, count]) => [area, count.toString()])

  if (edcAreaData.length > 0) {
    doc.setFontSize(16)
    doc.text("EDC Devices by Area (Top 10)", 20, (doc as any).lastAutoTable.finalY + 20)

    autoTable(doc, {
      head: [["Area", "EDC Count"]],
      body: edcAreaData,
      startY: (doc as any).lastAutoTable.finalY + 30,
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11] },
    })
  }

  // Add new page for merchant data if there are merchants
  if (merchants.length > 0) {
    doc.addPage()
    doc.setFontSize(16)
    doc.text("Merchant Data", 20, 20)

    // Prepare merchant data for table (showing key fields only due to space constraints)
    const merchantTableData = merchants
      .slice(0, 50)
      .map((merchant) => [
        merchant.merchantbrandname || "",
        merchant.alamat || "",
        merchant.segmen || "",
        merchant.cd_cbg || "",
        merchant["Tgl Pasang EDC"] && merchant["Tgl Pasang EDC"].trim() !== "" ? "Yes" : "No",
        merchant["Jml EDC"] || "0",
      ])

    autoTable(doc, {
      head: [["Merchant Name", "Address", "Segment", "Area", "Has EDC", "EDC Count"]],
      body: merchantTableData,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 8 },
      columnStyles: {
        1: { cellWidth: 40 }, // Address column wider
      },
    })

    if (merchants.length > 50) {
      doc.text(
        `Note: Showing first 50 merchants out of ${merchants.length} total`,
        20,
        (doc as any).lastAutoTable.finalY + 10,
      )
    }
  }

  // Generate filename with current date
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `Bank_Mandiri_Merchant_Report_${dateStr}.pdf`

  // Save the file
  doc.save(filename)
}
