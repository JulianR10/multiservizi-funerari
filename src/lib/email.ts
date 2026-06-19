import { resend } from "./resend"

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
}

function formatPrice(centesimi: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(centesimi / 100)
}

function emailTemplate(order: OrderData): string {
  const date = new Date(order.createdAt).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const itemsHtml = order.items
    .map(
      (item) => `
<tr>
  <td style="padding:12px 16px;border-bottom:1px solid #e5e0db;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;">${item.name} × ${item.quantity}</td>
  <td style="padding:12px 16px;border-bottom:1px solid #e5e0db;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;text-align:right;white-space:nowrap;">${formatPrice(item.price * item.quantity)}</td>
</tr>`
    )
    .join("")

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;">
  <table role="presentation" style="width:100%;background-color:#F5F0EB;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#772123;padding:32px 24px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:0.025em;">Petrungaro Multiservizi</h1>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#f5e6e6;font-weight:400;">Conferma d'ordine</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#27272a;font-weight:600;">Grazie per il tuo ordine!</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;line-height:1.6;">
                Il tuo pagamento è stato ricevuto con successo. Troverai il riepilogo dell'ordine qui sotto.
              </p>

              <!-- Order info -->
              <table role="presentation" style="width:100%;margin-top:24px;background-color:#faf0f0;border-radius:8px;padding:16px;">
                <tr>
                  <td style="padding:4px 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Data</span>
                    <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;font-weight:500;">${date}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Fattura</span>
                    <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;font-weight:500;">${order.invoiceNumber || "—"}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Email</span>
                    <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;font-weight:500;">${order.customerEmail}</p>
                  </td>
                </tr>
              </table>

              <!-- Items table -->
              <table role="presentation" style="width:100%;margin-top:24px;border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="padding:10px 16px;text-align:left;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #772123;">Prodotto</th>
                    <th style="padding:10px 16px;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #772123;">Importo</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <table role="presentation" style="width:100%;margin-top:8px;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;">Subtotale</td>
                  <td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;text-align:right;">${formatPrice(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;">IVA 22%</td>
                  <td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#27272a;text-align:right;">${formatPrice(order.tax)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#27272a;border-top:2px solid #772123;">Totale</td>
                  <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#772123;text-align:right;border-top:2px solid #772123;">${formatPrice(order.total)}</td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#52525b;line-height:1.6;text-align:center;">
                Per qualsiasi domanda, contattaci al <a href="tel:+39098271580" style="color:#772123;text-decoration:underline;">+39 0982 71580</a> o via WhatsApp al <a href="https://wa.me/393356691440" style="color:#772123;text-decoration:underline;">+39 335 6691440</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#faf0f0;padding:20px 24px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a1a1aa;">
                Via Trento, 11, II° Trav. — 87030 Fiumefreddo Bruzio (CS)<br />
                P.IVA: — mf@multiservizifunerarisrl.com
              </p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a1a1aa;">
                &copy; ${new Date().getFullYear()} Petrungaro Multiservizi. Tutti i diritti riservati.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendOrderConfirmation(order: OrderData) {
  const subject = `Ordine confermato — ${order.invoiceNumber || order.id}`

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Petrungaro Multiservizi <onboarding@resend.dev>",
    to: order.customerEmail,
    subject,
    html: emailTemplate(order),
  })

  if (error) {
    console.error("[EMAIL] Errore invio conferma ordine:", error)
  }
}

type ShippingData = {
  invoiceNumber: string | null
  customerEmail: string
  trackingNumber: string
  trackingUrl: string | null
}

export async function sendShippingConfirmation(data: ShippingData) {
  const subject = `Il tuo ordine è stato spedito — ${data.invoiceNumber || "Petrungaro Multiservizi"}`

  const trackingHtml = data.trackingUrl
    ? `<a href="${data.trackingUrl}" target="_blank" style="display:inline-block;background-color:#772123;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:50px;font-size:14px;font-weight:600;font-family:Arial,Helvetica,sans-serif;">Traccia il tuo pacco</a>`
    : `<span style="font-size:15px;color:#27272a;font-weight:500;font-family:Arial,Helvetica,sans-serif;">${data.trackingNumber}</span>`

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Petrungaro Multiservizi <onboarding@resend.dev>",
    to: data.customerEmail,
    subject,
    html: `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;">
  <table role="presentation" style="width:100%;background-color:#F5F0EB;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#772123;padding:32px 24px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:0.025em;">Petrungaro Multiservizi</h1>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#f5e6e6;font-weight:400;">Ordine spedito</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#27272a;font-weight:600;">Il tuo ordine è in viaggio! 🚚</p>
              <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;line-height:1.6;">
                Buone notizie! Il tuo ordine è stato spedito. Usa il codice di tracking qui sotto per seguire la consegna.
              </p>

              <div style="margin:28px 0;padding:20px;background-color:#faf0f0;border-radius:8px;display:inline-block;">
                <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Codice tracking</p>
                ${trackingHtml}
              </div>

              <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#52525b;line-height:1.6;">
                Per qualsiasi domanda, contattaci al <a href="tel:+39098271580" style="color:#772123;text-decoration:underline;">+39 0982 71580</a> o via WhatsApp al <a href="https://wa.me/393356691440" style="color:#772123;text-decoration:underline;">+39 335 6691440</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#faf0f0;padding:20px 24px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a1a1aa;">
                Via Trento, 11, II° Trav. — 87030 Fiumefreddo Bruzio (CS)<br />
                P.IVA: — mf@multiservizifunerarisrl.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })

  if (error) {
    console.error("[EMAIL] Errore invio conferma spedizione:", error)
  }
}
