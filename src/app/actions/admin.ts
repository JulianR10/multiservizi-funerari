"use server"

import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/format"
import { sendShippingConfirmation } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { getAdminSession } from "@/lib/admin-auth"
import { sanitizeCsvCell } from "@/lib/validators"

async function assertAdmin(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

function validateProduct(body: Record<string, unknown>) {
  const errors: string[] = []
  if (!body.name || typeof body.name !== "string") errors.push("Nome richiesto")
  if (typeof body.price !== "number" || body.price < 0) errors.push("Prezzo non valido")
  if (body.stock !== undefined && (typeof body.stock !== "number" || body.stock < 0 || !Number.isInteger(body.stock))) {
    errors.push("Stock non valido")
  }
  if (body.comparePrice !== undefined && body.comparePrice !== null && (typeof body.comparePrice !== "number" || body.comparePrice < 0)) {
    errors.push("ComparePrice non valido")
  }
  if (!body.categoryId || typeof body.categoryId !== "string") errors.push("Categoria richiesta")
  return errors
}

export async function upsertProduct(data: {
  id?: string
  name: string
  description: string
  price: number
  comparePrice: number | null
  images: string[]
  categoryId: string
  stock: number
  published: boolean
  featured: boolean
}): Promise<ActionResult> {
  if (!(await assertAdmin())) {
    return { success: false, error: "Non autorizzato" }
  }

  const errors = validateProduct(data)
  if (errors.length > 0) {
    return { success: false, error: errors.join(", ") }
  }

  if (data.id) {
    await prisma.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice || null,
        images: data.images,
        categoryId: data.categoryId,
        stock: data.stock,
        published: data.published,
        featured: data.featured,
      },
    })
  } else {
    await prisma.product.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        description: data.description || "",
        price: data.price,
        comparePrice: data.comparePrice || null,
        images: data.images || [],
        categoryId: data.categoryId,
        stock: data.stock || 0,
        published: data.published || false,
        featured: data.featured || false,
      },
    })
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true, data: undefined }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) {
    return { success: false, error: "Non autorizzato" }
  }

  const orderCount = await prisma.orderItem.count({ where: { productId: id } })
  if (orderCount > 0) {
    return {
      success: false,
      error: `Impossibile eliminare: il prodotto è presente in ${orderCount} ordine${orderCount === 1 ? "" : "i"}. Disabilita la pubblicazione invece di eliminarlo.`,
    }
  }

  await prisma.product.delete({ where: { id } })
  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true, data: undefined }
}

export async function updateOrder(data: {
  id: string
  status?: string
  trackingNumber?: string | null
  trackingUrl?: string | null
}): Promise<ActionResult> {
  if (!(await assertAdmin())) {
    return { success: false, error: "Non autorizzato" }
  }

  const updateData: Record<string, unknown> = {}

  if (data.status !== undefined) {
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(data.status)) {
      return { success: false, error: "Stato non valido" }
    }
    updateData.status = data.status
  }

  if (data.trackingNumber !== undefined) {
    updateData.trackingNumber = data.trackingNumber || null
  }

  if (data.trackingUrl !== undefined) {
    updateData.trackingUrl = data.trackingUrl || null
  }

  const order = await prisma.order.update({
    where: { id: data.id },
    data: updateData,
    include: { user: { select: { name: true, email: true } } },
  })

  if (data.trackingNumber && data.trackingNumber !== "") {
    const customerEmail = order.user?.email || order.guestEmail
    if (customerEmail) {
      sendShippingConfirmation({
        invoiceNumber: order.invoiceNumber,
        customerEmail,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl || null,
      }).catch((err) => console.error("[ADMIN] Errore invio email tracking:", err))
    }
  }

  revalidatePath("/admin/orders")
  revalidatePath("/track")
  return { success: true, data: undefined }
}

export async function exportOrdersCSV(): Promise<{ success: true; data: string } | { success: false; error: string }> {
  if (!(await assertAdmin())) {
    return { success: false, error: "Non autorizzato" }
  }

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10000,
  })

  const header = "Fattura,Cliente,Email,Data,Stato,Pagamento,Totale,Articoli"
  const rows = orders.map((o) => {
    const customer = o.user?.name || "Ospite"
    const email = o.user?.email || o.guestEmail || ""
    const date = o.createdAt.toISOString()
    const items = o.items.map((i) => `${i.name} x${i.quantity}`).join("; ")
    return [
      sanitizeCsvCell(o.invoiceNumber || o.id.slice(0, 8)),
      sanitizeCsvCell(customer),
      sanitizeCsvCell(email),
      sanitizeCsvCell(date),
      sanitizeCsvCell(o.status),
      sanitizeCsvCell(o.paymentStatus),
      (o.total / 100).toFixed(2),
      sanitizeCsvCell(items),
    ].join(",")
  })

  return { success: true, data: "\uFEFF" + [header, ...rows].join("\n") }
}

export async function refundOrder(
  orderId: string,
  amountCents?: number
): Promise<ActionResult> {
  if (!(await assertAdmin())) {
    return { success: false, error: "Non autorizzato" }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      stripePaymentIntentId: true,
      paymentStatus: true,
      total: true,
      invoiceNumber: true,
    },
  })

  if (!order) {
    return { success: false, error: "Ordine non trovato" }
  }

  if (order.paymentStatus !== "paid" && order.paymentStatus !== "partially_refunded") {
    return { success: false, error: "L'ordine non è stato pagato" }
  }

  if (!order.stripePaymentIntentId) {
    return { success: false, error: "Nessun payment intent associato" }
  }

  if (amountCents !== undefined) {
    if (typeof amountCents !== "number" || !Number.isInteger(amountCents) || amountCents <= 0) {
      return { success: false, error: "Importo non valido" }
    }
    if (amountCents > order.total) {
      return { success: false, error: "L'importo del rimborso supera il totale dell'ordine" }
    }
  }

  try {
    const { setPaymentProvider, refundPayment } = await import("@/lib/payments")
    const { stripeAdapter } = await import("@/lib/payment-adapters/stripe-adapter")
    setPaymentProvider(stripeAdapter)
    await refundPayment(order.stripePaymentIntentId, amountCents)

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true, data: undefined }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore durante il rimborso"
    console.error(`[ADMIN] Errore rimborso ordine ${order.invoiceNumber}:`, message)
    return { success: false, error: message }
  }
}
