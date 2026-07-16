import jsPDF from "jspdf"
import "jspdf-autotable"
import { COMPANY } from "./company"
import { formatPrice } from "./format"

type InvoiceItem = {
  name: string
  quantity: number
  price: number
}

type InvoiceData = {
  invoiceNumber: string
  date: Date
  customerName: string
  customerAddress?: string
  customerCity?: string
  customerPostalCode?: string
  customerProvince?: string
  customerCompany?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
}

export function generateInvoicePdf(data: InvoiceData): Buffer {
  const doc = new jsPDF()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(119, 33, 35)
  doc.text("FATTURA", 14, 25)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`N. ${data.invoiceNumber}`, 14, 32)
  doc.text(`Data: ${new Date(data.date).toLocaleDateString("it-IT")}`, 14, 38)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text("Fornitore:", 14, 55)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(COMPANY.name, 14, 62)
  doc.text(COMPANY.address, 14, 68)
  doc.text(COMPANY.city, 14, 74)
  doc.text(`P.IVA: ${COMPANY.piva}`, 14, 80)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Committente:", 120, 55)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  let clientY = 62
  if (data.customerCompany) {
    doc.text(data.customerCompany, 120, clientY)
    clientY += 6
  }
  doc.text(data.customerName, 120, clientY)
  if (data.customerAddress) {
    clientY += 6
    doc.text(data.customerAddress, 120, clientY)
  }
  if (data.customerPostalCode || data.customerCity) {
    clientY += 6
    doc.text(
      `${data.customerPostalCode || ""} ${data.customerCity || ""}`.trim(),
      120,
      clientY
    )
  }
  if (data.customerProvince) {
    clientY += 6
    doc.text(data.customerProvince, 120, clientY)
  }

  const tableData = data.items.map((item) => [
    item.name,
    String(item.quantity),
    formatPrice(item.price),
    formatPrice(item.price * item.quantity),
  ])

  ;(doc as any).autoTable({
    startY: 95,
    head: [["Prodotto", "Qtà", "Prezzo", "Importo"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [119, 33, 35],
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
  })

  const finalY = (doc as jsPDF & { previousAutoTable?: { finalY: number } }).previousAutoTable?.finalY || 95
  const summaryX = 120
  const valueX = 180

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text("Subtotale:", summaryX, finalY + 10)
  doc.text(formatPrice(data.subtotal), valueX, finalY + 10, { align: "right" })

  doc.text("IVA 22%:", summaryX, finalY + 16)
  doc.text(formatPrice(data.tax), valueX, finalY + 16, { align: "right" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(119, 33, 35)
  doc.text("TOTALE:", summaryX, finalY + 24)
  doc.text(formatPrice(data.total), valueX, finalY + 24, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(
    `${COMPANY.name} — ${COMPANY.address} — ${COMPANY.city} — P.IVA ${COMPANY.piva}`,
    14,
    280
  )
  doc.text(
    `Tel: ${COMPANY.phone} — Email: ${COMPANY.email}`,
    14,
    285
  )

  return Buffer.from(doc.output("arraybuffer"))
}
