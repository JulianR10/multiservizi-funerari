"use server"

import { prisma } from "@/lib/prisma"
import { getCustomerSession } from "@/lib/customer-auth"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

const MAX_NAME = 80
const MAX_NOTES = 500
const MAX_ITEMS = 100
const MAX_QTY = 999
const CART_COOKIE = "reorder_items"
const CART_COOKIE_MAX_AGE = 60 * 5

function trim(v: unknown, max: number = 200): string {
  if (typeof v !== "string") return ""
  return v.trim().slice(0, max)
}

function sanitizeQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isInteger(n) || n < 1) return 1
  return Math.min(MAX_QTY, n)
}

export type ListResult = { success: boolean; error?: string; id?: string }

async function getApprovedUser() {
  const session = await getCustomerSession()
  if (!session) return { error: "Devi effettuare l'accesso." as const }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, status: true, role: true },
  })
  if (!user || user.role !== "user" || user.status !== "APPROVED") {
    return { error: "Il tuo account non è abilitato." as const }
  }
  return { user }
}

export async function createList(name: string, notes?: string): Promise<ListResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const n = trim(name, MAX_NAME)
  if (!n) return { success: false, error: "Nome obbligatorio." }

  const count = await prisma.shoppingList.count({ where: { userId: auth.user.id } })
  if (count >= 50) {
    return { success: false, error: "Limite massimo di 50 liste raggiunto." }
  }

  const list = await prisma.shoppingList.create({
    data: {
      userId: auth.user.id,
      name: n,
      notes: trim(notes, MAX_NOTES) || null,
    },
  })

  revalidatePath("/account/lists")
  return { success: true, id: list.id }
}

export async function updateList(
  id: string,
  data: { name?: string; notes?: string }
): Promise<ListResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const existing = await prisma.shoppingList.findFirst({
    where: { id, userId: auth.user.id },
  })
  if (!existing) return { success: false, error: "Lista non trovata." }

  const update: Record<string, unknown> = {}
  if (data.name !== undefined) {
    const n = trim(data.name, MAX_NAME)
    if (!n) return { success: false, error: "Nome non valido." }
    update.name = n
  }
  if (data.notes !== undefined) {
    update.notes = trim(data.notes, MAX_NOTES) || null
  }

  await prisma.shoppingList.update({ where: { id }, data: update })
  revalidatePath("/account/lists")
  return { success: true }
}

export async function deleteList(id: string): Promise<ListResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const existing = await prisma.shoppingList.findFirst({
    where: { id, userId: auth.user.id },
  })
  if (!existing) return { success: false, error: "Lista non trovata." }

  await prisma.shoppingList.delete({ where: { id } })
  revalidatePath("/account/lists")
  return { success: true }
}

export async function duplicateList(id: string): Promise<ListResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const source = await prisma.shoppingList.findFirst({
    where: { id, userId: auth.user.id },
    include: { items: true },
  })
  if (!source) return { success: false, error: "Lista non trovata." }

  const count = await prisma.shoppingList.count({ where: { userId: auth.user.id } })
  if (count >= 50) {
    return { success: false, error: "Limite massimo di 50 liste raggiunto." }
  }

  const copy = await prisma.shoppingList.create({
    data: {
      userId: auth.user.id,
      name: `${source.name} (copia)`,
      notes: source.notes,
      items: {
        create: source.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
  })

  revalidatePath("/account/lists")
  return { success: true, id: copy.id }
}

export async function addItemToList(
  listId: string,
  productId: string,
  quantity: number = 1
): Promise<ListResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  if (typeof productId !== "string" || productId.length === 0 || productId.length > 64) {
    return { success: false, error: "Prodotto non valido." }
  }

  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId: auth.user.id },
  })
  if (!list) return { success: false, error: "Lista non trovata." }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, published: true },
  })
  if (!product) return { success: false, error: "Prodotto non più disponibile." }

  const itemCount = await prisma.shoppingListItem.count({ where: { listId } })
  if (itemCount >= MAX_ITEMS) {
    return { success: false, error: `La lista può contenere al massimo ${MAX_ITEMS} articoli.` }
  }

  const qty = sanitizeQty(quantity)

  await prisma.shoppingListItem.upsert({
    where: { listId_productId: { listId, productId } },
    update: { quantity: { increment: qty } },
    create: { listId, productId, quantity: qty },
  })

  await prisma.shoppingList.update({
    where: { id: listId },
    data: { updatedAt: new Date() },
  })

  revalidatePath("/account/lists")
  return { success: true }
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number
): Promise<ListResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    include: { list: { select: { userId: true } } },
  })
  if (!item || item.list.userId !== auth.user.id) {
    return { success: false, error: "Articolo non trovato." }
  }

  if (quantity < 1) {
    await prisma.shoppingListItem.delete({ where: { id: itemId } })
  } else {
    await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { quantity: sanitizeQty(quantity) },
    })
  }

  await prisma.shoppingList.update({
    where: { id: item.listId },
    data: { updatedAt: new Date() },
  })

  revalidatePath("/account/lists")
  return { success: true }
}

export async function removeItemFromList(itemId: string): Promise<ListResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    include: { list: { select: { userId: true } } },
  })
  if (!item || item.list.userId !== auth.user.id) {
    return { success: false, error: "Articolo non trovato." }
  }

  await prisma.shoppingListItem.delete({ where: { id: itemId } })
  await prisma.shoppingList.update({
    where: { id: item.listId },
    data: { updatedAt: new Date() },
  })

  revalidatePath("/account/lists")
  return { success: true }
}

export async function addListToCart(listId: string): Promise<ListResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId: auth.user.id },
    include: { items: true },
  })
  if (!list) return { success: false, error: "Lista non trovata." }

  if (list.items.length === 0) {
    return { success: false, error: "La lista è vuota." }
  }

  const productIds = list.items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, published: true },
    select: { id: true, name: true, price: true, images: true, slug: true, stock: true },
  })
  if (products.length === 0) {
    return {
      success: false,
      error: "Nessuno degli articoli della lista è più disponibile.",
    }
  }

  const payload = list.items
    .map((item) => {
      const p = products.find((p) => p.id === item.productId)
      if (!p) return null
      return {
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.images[0] || "",
        slug: p.slug,
        stock: p.stock,
        quantity: sanitizeQty(item.quantity),
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  if (payload.length === 0) {
    return {
      success: false,
      error: "Nessuno degli articoli della lista è più disponibile.",
    }
  }

  const c = await cookies()
  c.set(CART_COOKIE, JSON.stringify(payload), {
    httpOnly: false,
    sameSite: "lax",
    maxAge: CART_COOKIE_MAX_AGE,
    path: "/",
  })

  return { success: true }
}

export async function createListFromOrder(
  orderId: string,
  name?: string
): Promise<ListResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ userId: auth.user.id }, { guestEmail: auth.user.id }],
    },
    include: { items: { select: { productId: true, quantity: true } } },
  })
  if (!order) return { success: false, error: "Ordine non trovato." }
  if (order.items.length === 0) {
    return { success: false, error: "L'ordine è vuoto." }
  }

  const listName = trim(name, MAX_NAME) || `Ordine ${order.invoiceNumber || order.id.slice(0, 8)}`

  const count = await prisma.shoppingList.count({ where: { userId: auth.user.id } })
  if (count >= 50) {
    return { success: false, error: "Limite massimo di 50 liste raggiunto." }
  }

  const productIds = order.items.map((i) => i.productId)
  const existingProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, published: true },
    select: { id: true },
  })
  const existingSet = new Set(existingProducts.map((p) => p.id))

  const validItems = order.items.filter((i) => existingSet.has(i.productId))
  if (validItems.length === 0) {
    return { success: false, error: "Nessuno degli articoli dell'ordine è più disponibile." }
  }

  const list = await prisma.shoppingList.create({
    data: {
      userId: auth.user.id,
      name: listName,
      items: {
        create: validItems.map((item) => ({
          productId: item.productId,
          quantity: sanitizeQty(item.quantity),
        })),
      },
    },
  })

  revalidatePath("/account/lists")
  return { success: true, id: list.id }
}
