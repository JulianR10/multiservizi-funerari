import jsPDF from "jspdf"
import { COMPANY } from "./company"

type DdtItem = {
  name: string
  quantity: number
}

type DdtData = {
  ddtNumber: string
  date: Date
  orderNumber: string
  invoiceNumber: string | null
  customerName: string
  customerAddress?: string
  customerCity?: string
  customerPostalCode?: string
  customerProvince?: string
  customerCompany?: string
  items: DdtItem[]
  totalPackages: number
  totalWeight?: number
  cause?: "VENDITA" | "RESO" | "CAMPIONE" | "CONTO LAVORAZIONE" | "CONTO VISIONE"
  carrier?: string
  notes?: string
}

export function generateDdtPdf(data: DdtData): Buffer {
  const doc = new jsPDF()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(119, 33, 35)
  doc.text("DOCUMENTO DI TRASPORTO (D.D.T.)", 14, 25)

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text("D.P.R. 472/96 e D.P.R. 696/96", 14, 31)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(`N. ${data.ddtNumber}`, 14, 40)
  doc.text(
    `Data: ${new Date(data.date).toLocaleDateString("it-IT")}`,
    14,
    46
  )
  doc.text(`Ordine: ${data.orderNumber}`, 14, 52)
  if (data.invoiceNumber) {
    doc.text(`Fattura: ${data.invoiceNumber}`, 14, 58)
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Mittente:", 14, 75)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(COMPANY.name, 14, 82)
  doc.text(COMPANY.sedeLegale, 14, 88)
  doc.text(`P.IVA: ${COMPANY.piva}`, 14, 94)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Destinatario:", 110, 75)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  let destY = 82
  if (data.customerCompany) {
    doc.text(data.customerCompany, 110, destY)
    destY += 6
  }
  doc.text(data.customerName, 110, destY)
  if (data.customerAddress) {
    destY += 6
    doc.text(data.customerAddress, 110, destY)
  }
  if (data.customerPostalCode || data.customerCity) {
    destY += 6
    doc.text(
      `${data.customerPostalCode || ""} ${data.customerCity || ""}`.trim(),
      110,
      destY
    )
  }
  if (data.customerProvince) {
    destY += 6
    doc.text(`(${data.customerProvince})`, 110, destY)
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text("Causale trasporto:", 14, 115)
  doc.setFont("helvetica", "normal")
  doc.text(data.cause || "VENDITA", 60, 115)

  doc.setFont("helvetica", "bold")
  doc.text("Colli:", 14, 122)
  doc.setFont("helvetica", "normal")
  doc.text(String(data.totalPackages), 60, 122)

  if (data.totalWeight) {
    doc.setFont("helvetica", "bold")
    doc.text("Peso (kg):", 14, 129)
    doc.setFont("helvetica", "normal")
    doc.text(String(data.totalWeight), 60, 129)
  }

  if (data.carrier) {
    doc.setFont("helvetica", "bold")
    doc.text("Vettore:", 14, 136)
    doc.setFont("helvetica", "normal")
    doc.text(data.carrier, 60, 136)
  }

  const tableData = data.items.map((item) => [
    item.name,
    String(item.quantity),
  ])

  ;(doc as unknown as { autoTable: (opts: unknown) => void }).autoTable({
    startY: 150,
    head: [["Descrizione articolo", "Qtà"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [119, 33, 35],
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { halign: "center", cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  })

  const finalY =
    (doc as unknown as { previousAutoTable?: { finalY: number } })
      .previousAutoTable?.finalY || 200

  if (data.notes) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Note:", 14, finalY + 12)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const splitNotes = doc.splitTextToSize(data.notes, 180)
    doc.text(splitNotes, 14, finalY + 18)
  }

  const signatureY = 260
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text("Firma del conducente: ______________________", 14, signatureY)
  doc.text("Firma del destinatario: ______________________", 110, signatureY)

  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text(
    `${COMPANY.name} — ${COMPANY.sedeLegale} — P.IVA ${COMPANY.piva} — Tel. ${COMPANY.phone}`,
    14,
    285
  )

  return Buffer.from(doc.output("arraybuffer"))
}
