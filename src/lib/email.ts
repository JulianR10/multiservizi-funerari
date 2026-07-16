import { resend } from "./resend"
import { generateInvoicePdf } from "./invoice-pdf"
import { COMPANY } from "./company"
import { formatPrice } from "./format"

export type EmailData = {
  from: string
  to: string
  subject: string
  html: string
  attachments?: { filename: string; content: Buffer }[]
}

export interface EmailSender {
  send(data: EmailData): Promise<{ error?: unknown }>
}

const resendSender: EmailSender = {
  async send(data) {
    const { error } = await resend.emails.send(data)
    return { error }
  },
}

let currentSender: EmailSender = resendSender

export function setEmailSender(sender: EmailSender) {
  currentSender = sender
}

const DEFAULT_FROM = "Petrungaro Multiservizi <onboarding@resend.dev>"

async function send(opts: {
  to: string
  subject: string
  html: string
  attachments?: { filename: string; content: Buffer }[]
}) {
  const { error } = await currentSender.send({
    from: process.env.EMAIL_FROM || DEFAULT_FROM,
    ...opts,
  })
  if (error) console.error("[EMAIL]", error)
}

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}) {
  await send(opts)
}

type OrderItemData = {
  name: string
  quantity: number
  price: number
}

type OrderData = {
  id: string
  invoiceNumber: string | null
  subtotal: number
  tax: number
  total: number
  createdAt: Date
  items: OrderItemData[]
  customerEmail: string
  customerName?: string | null
  shippingAddress?: {
    firstName?: string
    lastName?: string
    company?: string
    address?: string
    city?: string
    postalCode?: string
    province?: string
  } | null
}

type ShippingData = {
  invoiceNumber: string | null
  customerEmail: string
  trackingNumber: string
  trackingUrl: string | null
}

type RefundData = {
  invoiceNumber: string | null
  total: number
  amountRefunded: number
  isPartial: boolean
  customerEmail: string
}

function emailLayout(subtitle: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#F5F0EB;">
  <table role="presentation" style="width:100%;background-color:#F5F0EB;padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background-color:#772123;padding:32px 24px;text-align:center;">
          <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:0.025em;">Petrungaro Multiservizi</h1>
          <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#f5e6e6;font-weight:400;">${subtitle}</p>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          ${bodyHtml}
          <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#52525b;line-height:1.6;text-align:center;">
            Per qualsiasi domanda, contattaci al <a href="tel:+39098271580" style="color:#772123;text-decoration:underline;">+39 0982 71580</a> o via WhatsApp al <a href="https://wa.me/393356691440" style="color:#772123;text-decoration:underline;">+39 335 6691440</a>.
          </p>
        </td></tr>
        <tr><td style="background-color:#faf0f0;padding:20px 24px;text-align:center;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a1a1aa;">
            ${COMPANY.address} — ${COMPANY.city}<br />
            P.IVA: ${COMPANY.piva} — ${COMPANY.email}
          </p>
          <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a1a1aa;">
            &copy; ${new Date().getFullYear()} Petrungaro Multiservizi. Tutti i diritti riservati.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function itemsTableHtml(items: OrderItemData[]): string {
  const rows = items.map((item) => `
<tr>
  <td style="padding:12px 16px;border-bottom:1px solid #e5e0db;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;">${item.name} × ${item.quantity}</td>
  <td style="padding:12px 16px;border-bottom:1px solid #e5e0db;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;text-align:right;white-space:nowrap;">${formatPrice(item.price * item.quantity)}</td>
</tr>`).join("")

  return `<table role="presentation" style="width:100%;margin-top:24px;border-collapse:collapse;">
    <thead>
      <tr>
        <th style="padding:10px 16px;text-align:left;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #772123;">Prodotto</th>
        <th style="padding:10px 16px;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #772123;">Importo</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

function totalsHtml(subtotal: number, tax: number, total: number): string {
  return `<table role="presentation" style="width:100%;margin-top:8px;border-collapse:collapse;">
    <tr><td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;">Subtotale</td><td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;text-align:right;">${formatPrice(subtotal)}</td></tr>
    <tr><td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;">IVA 22%</td><td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;text-align:right;">${formatPrice(tax)}</td></tr>
    <tr><td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#27272a;border-top:2px solid #772123;">Totale</td><td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#772123;text-align:right;border-top:2px solid #772123;">${formatPrice(total)}</td></tr>
  </table>`
}

export async function sendOrderConfirmation(order: OrderData) {
  const subject = `Ordine confermato — ${order.invoiceNumber || order.id}`

  let pdfAttachment: { filename: string; content: Buffer } | undefined
  if (order.invoiceNumber) {
    try {
      const pdfBuffer = generateInvoicePdf({
        invoiceNumber: order.invoiceNumber,
        date: order.createdAt,
        customerName: order.customerName || order.customerEmail,
        customerAddress: order.shippingAddress?.address,
        customerCity: order.shippingAddress?.city,
        customerPostalCode: order.shippingAddress?.postalCode,
        customerProvince: order.shippingAddress?.province,
        customerCompany: order.shippingAddress?.company,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
      })
      pdfAttachment = { filename: `${order.invoiceNumber}.pdf`, content: pdfBuffer }
    } catch (err) {
      console.error("[EMAIL] Errore generazione PDF fattura:", err)
    }
  }

  const date = new Date(order.createdAt).toLocaleDateString("it-IT", {
    day: "numeric", month: "long", year: "numeric",
  })

  const body = `
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#27272a;font-weight:600;">Grazie per il tuo ordine!</p>
    <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;line-height:1.6;">Il tuo pagamento è stato ricevuto con successo. Troverai il riepilogo dell'ordine qui sotto.</p>
    <table role="presentation" style="width:100%;margin-top:24px;background-color:#faf0f0;border-radius:8px;padding:16px;">
      <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#71717a;text-transform:uppercase;">Data</span><p style="margin:2px 0 0;font-size:14px;color:#27272a;font-weight:500;">${date}</p></td></tr>
      <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#71717a;text-transform:uppercase;">Fattura</span><p style="margin:2px 0 0;font-size:14px;color:#27272a;font-weight:500;">${order.invoiceNumber || "—"}</p></td></tr>
      <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#71717a;text-transform:uppercase;">Email</span><p style="margin:2px 0 0;font-size:14px;color:#27272a;font-weight:500;">${order.customerEmail}</p></td></tr>
    </table>
    ${itemsTableHtml(order.items)}
    ${totalsHtml(order.subtotal, order.tax, order.total)}`

  await send({
    to: order.customerEmail,
    subject,
    html: emailLayout("Conferma d'ordine", body),
    attachments: pdfAttachment ? [pdfAttachment] : undefined,
  })
}

export async function sendAdminNewOrderNotification(order: OrderData) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL
  if (!adminEmail) return

  const date = new Date(order.createdAt).toLocaleDateString("it-IT", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  })

  const body = `
    <table style="width:100%;background-color:#faf0f0;border-radius:8px;padding:16px;">
      <tr><td style="padding:2px 0;"><span style="font-size:11px;color:#71717a;text-transform:uppercase;">Ordine</span><p style="margin:0;font-size:14px;color:#27272a;font-weight:500;">${order.invoiceNumber || order.id}</p></td></tr>
      <tr><td style="padding:2px 0;"><span style="font-size:11px;color:#71717a;text-transform:uppercase;">Data</span><p style="margin:0;font-size:14px;color:#27272a;font-weight:500;">${date}</p></td></tr>
      <tr><td style="padding:2px 0;"><span style="font-size:11px;color:#71717a;text-transform:uppercase;">Cliente</span><p style="margin:0;font-size:14px;color:#27272a;font-weight:500;">${order.customerEmail}${order.customerName ? ` (${order.customerName})` : ""}</p></td></tr>
    </table>
    ${itemsTableHtml(order.items)}
    <table style="width:100%;margin-top:4px;">
      <tr><td style="padding:6px 12px;font-size:13px;color:#52525b;">Totale</td><td style="padding:6px 12px;font-size:15px;font-weight:700;color:#772123;text-align:right;">${formatPrice(order.total)}</td></tr>
    </table>`

  await send({
    to: adminEmail,
    subject: `Nuovo ordine — ${order.invoiceNumber || order.id}`,
    html: emailLayout("Nuovo ordine ricevuto", body),
  })
}

export async function sendRefundNotification(data: RefundData) {
  const refundType = data.isPartial ? "Rimborso parziale" : "Rimborso completo"
  const subject = `${refundType} — ${data.invoiceNumber || "Petrungaro Multiservizi"}`

  const body = `
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#27272a;font-weight:600;">Il tuo rimborso è stato elaborato</p>
    <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;line-height:1.6;">
      ${data.isPartial
        ? `È stato rimborsato un importo parziale di ${formatPrice(data.amountRefunded)} su un totale di ${formatPrice(data.total)}.`
        : `L'intero importo di ${formatPrice(data.total)} è stato rimborsato.`
      }
      Il rimborso sarà visibile sulla tua carta di credito entro 5-10 giorni lavorativi.
    </p>
    <table role="presentation" style="width:100%;margin-top:24px;background-color:#faf0f0;border-radius:8px;padding:16px;">
      <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#71717a;text-transform:uppercase;">Ordine</span><p style="margin:2px 0 0;font-size:14px;color:#27272a;font-weight:500;">${data.invoiceNumber || "—"}</p></td></tr>
      <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#71717a;text-transform:uppercase;">Importo rimborsato</span><p style="margin:2px 0 0;font-size:14px;color:#772123;font-weight:600;">${formatPrice(data.amountRefunded)}</p></td></tr>
    </table>`

  await send({
    to: data.customerEmail,
    subject,
    html: emailLayout(refundType, body),
  })
}

export async function sendShippingConfirmation(data: ShippingData) {
  const subject = `Il tuo ordine è stato spedito — ${data.invoiceNumber || "Petrungaro Multiservizi"}`

  const trackingHtml = data.trackingUrl
    ? `<a href="${data.trackingUrl}" target="_blank" style="display:inline-block;background-color:#772123;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:50px;font-size:14px;font-weight:600;font-family:Arial,Helvetica,sans-serif;">Traccia il tuo pacco</a>`
    : `<span style="font-size:15px;color:#27272a;font-weight:500;font-family:Arial,Helvetica,sans-serif;">${data.trackingNumber}</span>`

  const body = `
    <div style="text-align:center;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#27272a;font-weight:600;">Il tuo ordine è in viaggio</p>
      <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;line-height:1.6;">
        Buone notizie! Il tuo ordine è stato spedito. Usa il codice di tracking qui sotto per seguire la consegna.
      </p>
      <div style="margin:28px 0;padding:20px;background-color:#faf0f0;border-radius:8px;display:inline-block;">
        <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Codice tracking</p>
        ${trackingHtml}
      </div>
    </div>`

  await send({
    to: data.customerEmail,
    subject,
    html: emailLayout("Ordine spedito", body),
  })
}
