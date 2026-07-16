"use server"

import { prisma } from "@/lib/prisma"
import { getCustomerSession } from "@/lib/customer-auth"
import { cookies } from "next/headers"

const REORDER_COOKIE = "reorder_items"
const MAX_AGE = 60 * 5

export async function reorderFromOrder(
  items: { productId: string; quantity: number }[]
): Promise<{ success: boolean; error?: string }> {
  const session = await getCustomerSession()
  if (!session) {
    return { success: false, error: "Devi effettuare l'accesso per riordinare." }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "Nessun articolo da riordinare." }
  }

  const cleanItems = items
    .filter((i) => i && typeof i.productId === "string" && i.productId.length > 0)
    .map((i) => ({
      productId: i.productId,
      quantity: Math.max(1, Math.min(999, Number(i.quantity) || 1)),
    }))
    .slice(0, 50)

  if (cleanItems.length === 0) {
    return { success: false, error: "Articoli non validi." }
  }

  const existing = await prisma.product.findMany({
    where: { id: { in: cleanItems.map((i) => i.productId) }, published: true },
    select: { id: true, name: true, price: true, images: true, slug: true, stock: true },
  })

  if (existing.length === 0) {
    return { success: false, error: "Nessuno degli articoli è più disponibile." }
  }

  const cartPayload = existing.map((p) => ({
    productId: p.id,
    name: p.name,
    price: p.price,
    image: p.images[0] || "",
    slug: p.slug,
    stock: p.stock,
    quantity: cleanItems.find((i) => i.productId === p.id)?.quantity || 1,
  }))

  const c = await cookies()
  c.set(REORDER_COOKIE, JSON.stringify(cartPayload), {
    httpOnly: false,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  })

  return { success: true }
}
