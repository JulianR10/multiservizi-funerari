import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { computeTax } from "@/lib/tax"
import { qualifiesForFreeShipping } from "@/lib/shipping"
import { validateStock, computeSubtotal } from "@/lib/order-utils"
import type {
  PaymentProvider,
  SessionResult,
  WebhookEvent,
} from "@/lib/payments"

export const stripeAdapter: PaymentProvider = {
  async createCheckoutSession(data) {
    const productIds = data.items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, published: true },
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    await validateStock(data.items, productMap)

    const subtotal = computeSubtotal(data.items, productMap)

    const freeShipping = qualifiesForFreeShipping(subtotal)

    let shippingCost = 0
    let shippingMethod = null
    if (data.shippingMethodId && !freeShipping) {
      shippingMethod = await prisma.shippingMethod.findUnique({
        where: { id: data.shippingMethodId },
      })
      if (!shippingMethod || !shippingMethod.active) {
        throw new Error("Metodo di spedizione non valido")
      }
      shippingCost = shippingMethod.price
    }

    const tax = computeTax(subtotal)

    const lineItems = data.items.map((item) => {
      const product = productMap.get(item.productId)!
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            images: product.images,
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      }
    })

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: `Spedizione ${shippingMethod!.name}`, images: [] },
          unit_amount: shippingCost,
        },
        quantity: 1,
      })
    }

    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: "IVA 22%", images: [] },
        unit_amount: tax,
      },
      quantity: 1,
    })

    const itemsStr = JSON.stringify(
      data.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    )
    if (itemsStr.length > 450) {
      throw new Error(
        "Il carrello contiene troppi articoli. Si prega di ridurre la quantità o suddividere l'ordine."
      )
    }

    const pendingCheckout = await prisma.pendingCheckout.create({
      data: {
        guestEmail: data.customerEmail,
        userId: data.userId || null,
        items: data.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingMethodId: data.shippingMethodId || null,
        ...(data.shippingAddress
          ? {
              shippingAddress: {
                firstName: data.shippingAddress.firstName || "",
                lastName: data.shippingAddress.lastName || "",
                company: data.shippingAddress.company || "",
                address: data.shippingAddress.address || "",
                address2: data.shippingAddress.address2 || "",
                city: data.shippingAddress.city || "",
                province: data.shippingAddress.province || "",
                postalCode: data.shippingAddress.postalCode || "",
                country: "IT",
                phone: data.shippingAddress.phone || "",
              },
            }
          : {}),
        ...(data.billingAddress
          ? {
              billingAddress: {
                firstName: data.billingAddress.firstName || "",
                lastName: data.billingAddress.lastName || "",
                company: data.billingAddress.company || "",
                address: data.billingAddress.address || "",
                address2: data.billingAddress.address2 || "",
                city: data.billingAddress.city || "",
                province: data.billingAddress.province || "",
                postalCode: data.billingAddress.postalCode || "",
                country: "IT",
              },
            }
          : {}),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const metadata: Record<string, string> = {
      pendingCheckoutId: pendingCheckout.id,
      guestEmail: data.customerEmail,
      items: itemsStr,
    }
    if (data.userId) metadata.userId = data.userId

    const session = await stripe.checkout.sessions.create({
      customer_email: data.customerEmail,
      customer_creation: "always",
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/ordine-confermato?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/carrello?cancelled=true`,
      metadata,
    })

    return { url: session.url! }
  },

  async retrieveSession(sessionId: string): Promise<SessionResult> {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    })

    const lineItems =
      session.line_items?.data.map((item) => ({
        name: item.description || "Prodotto",
        quantity: item.quantity || 0,
        total: item.amount_total || 0,
      })) || []

    const paymentIntentId = session.payment_intent
      ? typeof session.payment_intent === "object"
        ? session.payment_intent.id
        : session.payment_intent
      : null

    const order = await prisma.order.findFirst({
      where: { stripePaymentId: sessionId },
      select: { estimatedDelivery: true },
    })

    return {
      id: session.id,
      paymentIntentId,
      customerEmail:
        "customer_details" in session && session.customer_details
          ? session.customer_details.email || null
          : session.customer_email || null,
      total: session.amount_total || 0,
      subtotal: session.amount_subtotal || 0,
      lineItems,
      paymentStatus: session.payment_status,
      estimatedDelivery: order?.estimatedDelivery || null,
    }
  },

  async processRefund(paymentIntentId: string, amount?: number) {
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount ? { amount } : {}),
      reason: "requested_by_customer",
    })
  },

  constructWebhookEvent(body: string, signature: string): WebhookEvent {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    ) as unknown as WebhookEvent
  },
}
