"use server"

import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/format"
import { sendShippingConfirmation } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { getAdminSession } from "@/lib/admin-auth"

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function assertAdmin(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}

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
