import { prisma } from "./prisma"
import { computeTax } from "./tax"
import { qualifiesForFreeShipping } from "./shipping"
import {
  sendOrderConfirmation,
  sendAdminNewOrderNotification,
  sendRefundNotification,
  sendEmail,
} from "./email"
import { validateStock, computeSubtotal } from "./order-utils"

export type CheckoutItem = {
  productId: string
  quantity: number
}

export type CheckoutSessionData = {
  items: CheckoutItem[]
  customerEmail: string
  userId?: string
  shippingMethodId?: string
  shippingAddress?: Record<string, string>
  billingAddress?: Record<string, string>
}

export type SessionResult = {
  id: string
  paymentIntentId: string | null
  customerEmail: string | null
  total: number
  subtotal: number
  lineItems: { name: string; quantity: number; total: number }[]
  paymentStatus: string
  estimatedDelivery: Date | null
}

export type WebhookEvent = {
  type: string
  data: { object: Record<string, unknown> }
}

export interface PaymentProvider {
  createCheckoutSession(data: CheckoutSessionData): Promise<{ url: string }>
  retrieveSession(sessionId: string): Promise<SessionResult>
  processRefund(paymentIntentId: string, amount?: number): Promise<void>
  constructWebhookEvent(body: string, signature: string): WebhookEvent
}

let currentProvider: PaymentProvider | null = null

export function setPaymentProvider(provider: PaymentProvider) {
  currentProvider = provider
}

function getProvider(): PaymentProvider {
  if (!currentProvider) throw new Error("PaymentProvider not set")
  return currentProvider
}

export async function createCheckout(data: CheckoutSessionData) {
  return await getProvider().createCheckoutSession(data)
}

export async function getSession(sessionId: string) {
  return await getProvider().retrieveSession(sessionId)
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  await getProvider().processRefund(paymentIntentId, amount)
}

export async function confirmOrder(event: WebhookEvent) {
  const session = event.data.object as Record<string, unknown>
  const rawMeta = (session.metadata || {}) as Record<string, string>

  const guestEmail = rawMeta.guestEmail
  const stripePaymentId = session.id as string
  const stripePaymentIntentId = (session.payment_intent as string) || null
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null
  const pendingCheckoutId = rawMeta.pendingCheckoutId

  let pendingCheckout: {
    items: unknown
    shippingMethodId: string | null
    shippingAddress: unknown
    billingAddress: unknown
    userId: string | null
    consumed: boolean
  } | null = null

  if (pendingCheckoutId) {
    pendingCheckout = await prisma.pendingCheckout.findUnique({
      where: { id: pendingCheckoutId },
    })
    if (!pendingCheckout) {
      console.error(`[WEBHOOK] PendingCheckout ${pendingCheckoutId} non trovato`)
      return
    }
    if (pendingCheckout.consumed) {
      console.log(`[WEBHOOK] PendingCheckout ${pendingCheckoutId} già consumato, evento duplicato`)
      return
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where: { stripePaymentId },
      })
      if (existing) return

      if (pendingCheckout) {
        await tx.pendingCheckout.update({
          where: { id: pendingCheckoutId },
          data: { consumed: true },
        })
      }

      const items: CheckoutItem[] = pendingCheckout
        ? (pendingCheckout.items as CheckoutItem[])
        : JSON.parse(rawMeta.items)

      const productIds = items.map((i) => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      })
      const productMap = new Map(products.map((p) => [p.id, p]))

      await validateStock(items, productMap)

      const subtotal = computeSubtotal(items, productMap)
      const tax = computeTax(subtotal)

      let shippingCost = 0
      let estimatedDelivery: Date | null = null
      const shippingMethodIdFromPending = pendingCheckout?.shippingMethodId ?? null

      if (qualifiesForFreeShipping(subtotal)) {
        shippingCost = 0
      } else if (shippingMethodIdFromPending) {
        const method = await tx.shippingMethod.findUnique({
          where: { id: shippingMethodIdFromPending },
        })
        if (method) {
          shippingCost = method.price
          if (method.estimatedDaysMin) {
            const d = new Date()
            d.setDate(d.getDate() + method.estimatedDaysMin)
            estimatedDelivery = d
          }
        }
      }

      const total = (session.amount_total as number) ?? subtotal + tax + shippingCost

      const now = new Date()
      const todayPrefix = `FATT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-`
      const lastOrder = await tx.order.findFirst({
        where: { invoiceNumber: { startsWith: todayPrefix } },
        orderBy: { invoiceNumber: "desc" },
        select: { invoiceNumber: true },
      })
      let nextSeq = 1
      if (lastOrder?.invoiceNumber) {
        const lastSeq = parseInt(lastOrder.invoiceNumber.split("-").pop() || "0", 10)
        nextSeq = lastSeq + 1
      }
      const invoiceNumber = `${todayPrefix}${String(nextSeq).padStart(4, "0")}`

      const userIdFromPending = pendingCheckout?.userId ?? null
      const finalUserId = userIdFromPending || rawMeta.userId || null

      const order = await tx.order.create({
        data: {
          guestEmail,
          userId: finalUserId,
          subtotal,
          tax,
          shippingCost,
          total,
          invoiceNumber,
          status: "confirmed",
          paymentStatus: "paid",
          paymentMethod: "stripe",
          stripePaymentId,
          stripePaymentIntentId,
          stripeCustomerId,
          shippingMethodId: qualifiesForFreeShipping(subtotal)
            ? null
            : shippingMethodIdFromPending,
          estimatedDelivery,
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId)!
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                name: product.name,
              }
            }),
          },
        },
      })

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      const shippingAddress = pendingCheckout?.shippingAddress as Record<string, string> | null
      if (shippingAddress) {
        const addressRecord = await tx.address.create({
          data: {
            firstName: shippingAddress.firstName || "",
            lastName: shippingAddress.lastName || "",
            company: shippingAddress.company || "",
            address: shippingAddress.address || "",
            address2: shippingAddress.address2 || "",
            city: shippingAddress.city || "",
            province: shippingAddress.province || "",
            postalCode: shippingAddress.postalCode || "",
            country: shippingAddress.country || "IT",
            phone: shippingAddress.phone || "",
          },
        })
        await tx.order.update({
          where: { id: order.id },
          data: { shippingAddressId: addressRecord.id },
        })
      }

      const billingAddress = pendingCheckout?.billingAddress as Record<string, string> | null
      if (billingAddress) {
        const addressRecord = await tx.address.create({
          data: {
            firstName: billingAddress.firstName || "",
            lastName: billingAddress.lastName || "",
            company: billingAddress.company || "",
            address: billingAddress.address || "",
            address2: billingAddress.address2 || "",
            city: billingAddress.city || "",
            province: billingAddress.province || "",
            postalCode: billingAddress.postalCode || "",
            country: billingAddress.country || "IT",
          },
        })
        await tx.order.update({
          where: { id: order.id },
          data: { billingAddressId: addressRecord.id },
        })
      }

      if (guestEmail) {
        const orderItems = items.map((item) => {
          const product = productMap.get(item.productId)!
          return { name: product.name, quantity: item.quantity, price: product.price }
        })

        const customerName = shippingAddress
          ? `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim()
          : null

        await sendOrderConfirmation({
          id: order.id,
          invoiceNumber: order.invoiceNumber,
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          createdAt: order.createdAt,
          items: orderItems,
          customerEmail: guestEmail,
          customerName,
          shippingAddress: shippingAddress || null,
        }).catch((err) => console.error("[WEBHOOK] Errore invio email conferma ordine:", err))

        await sendAdminNewOrderNotification({
          id: order.id,
          invoiceNumber: order.invoiceNumber,
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          createdAt: order.createdAt,
          items: orderItems,
          customerEmail: guestEmail,
        }).catch((err) => console.error("[WEBHOOK] Errore notifica admin nuovo ordine:", err))
      }
    })
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002" &&
      "meta" in err &&
      (err as { meta?: { target?: string[] } }).meta?.target?.includes("stripePaymentId")
    ) {
      console.log(`[WEBHOOK] Evento duplicato ignorato: ${stripePaymentId}`)
      return
    }

    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(`[WEBHOOK] Errore critico — ordine NON creato per ${stripePaymentId}:`, errorMessage)

    try {
      if (stripePaymentIntentId) {
        await getProvider().processRefund(stripePaymentIntentId)
      }
      console.log(`[WEBHOOK] Rimborso avviato per ${stripePaymentId}`)
    } catch (refundErr) {
      console.error(`[WEBHOOK] Errore nel rimborso per ${stripePaymentId}:`, refundErr)
    }
  }
}

export async function handleChargeRefunded(event: WebhookEvent) {
  const charge = event.data.object as Record<string, unknown>
  const paymentIntentId = charge.payment_intent as string
  const amountRefunded = charge.amount_refunded as number
  const amountTotal = charge.amount as number

  if (!paymentIntentId) return

  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!order) {
    console.error(`[WEBHOOK] Ordine non trovato per payment intent ${paymentIntentId}`)
    return
  }

  if (order.paymentStatus === "refunded") return

  const isPartialRefund = amountRefunded < amountTotal

  if (isPartialRefund) {
    const refundNote = `Rimborsato parzialmente: ${amountRefunded} di ${amountTotal} centesimi il ${new Date().toISOString()}`
    if (order.notes?.includes(refundNote)) {
      return
    }
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "partially_refunded",
        notes: order.notes ? `${order.notes}\n${refundNote}` : refundNote,
      },
    })
    console.log(`[WEBHOOK] Ordine ${order.invoiceNumber} rimborsato parzialmente (${amountRefunded}/${amountTotal})`)
  } else {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    })

    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "refunded",
        status: "cancelled",
        notes: order.notes
          ? `${order.notes}\nRimborsato il ${new Date().toISOString()}`
          : `Rimborsato il ${new Date().toISOString()}`,
      },
    })
    console.log(`[WEBHOOK] Ordine ${order.invoiceNumber} rimborsato completamente, stock ripristinato`)
  }

  const customerEmail = order.guestEmail
  if (customerEmail) {
    await sendRefundNotification({
      invoiceNumber: order.invoiceNumber,
      total: order.total,
      amountRefunded,
      isPartial: isPartialRefund,
      customerEmail,
    }).catch((err) => console.error("[WEBHOOK] Errore email rimborso:", err))
  }
}

export async function handlePaymentFailed(event: WebhookEvent) {
  const intent = event.data.object as Record<string, unknown>
  const paymentIntentId = intent.id as string
  const lastError = (intent.last_payment_error as { message?: string } | undefined)?.message
  console.error(
    `[WEBHOOK] Pagamento fallito: ${paymentIntentId}${lastError ? ` — ${lastError}` : ""}`
  )

  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { items: true },
  })

  if (!order) {
    return
  }

  if (order.paymentStatus === "pending") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "cancelled",
        paymentStatus: "failed",
        notes: order.notes
          ? `${order.notes}\nPagamento fallito il ${new Date().toISOString()}`
          : `Pagamento fallito il ${new Date().toISOString()}`,
      },
    })
  }

  if (order.guestEmail) {
    try {
      await sendEmail({
        to: order.guestEmail,
        subject: `Pagamento non riuscito — ${order.invoiceNumber || "Petrungaro Multiservizi"}`,
        html: `<p>Il pagamento per il tuo ordine <strong>${order.invoiceNumber || order.id}</strong> non è andato a buon fine.</p><p>${lastError ? `Motivo: ${lastError}<br/>` : ""}Puoi riprovare dal carrello. Per assistenza contattaci al +39 0982 71580.</p>`,
      })
    } catch (err) {
      console.error("[WEBHOOK] Errore notifica pagamento fallito:", err)
    }
  }
}

export async function handleCheckoutExpired(event: WebhookEvent) {
  const session = event.data.object as Record<string, unknown>
  const sessionId = session.id as string
  const rawMeta = (session.metadata || {}) as Record<string, string>
  const pendingCheckoutId = rawMeta.pendingCheckoutId

  console.log(`[WEBHOOK] Checkout session scaduta: ${sessionId}`)

  if (pendingCheckoutId) {
    try {
      await prisma.pendingCheckout.delete({
        where: { id: pendingCheckoutId },
      })
    } catch (err) {
      console.warn(`[WEBHOOK] Impossibile eliminare PendingCheckout ${pendingCheckoutId}:`, err)
    }
  }
}
