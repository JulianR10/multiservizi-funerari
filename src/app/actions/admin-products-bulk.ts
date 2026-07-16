"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getAdminSession } from "@/lib/admin-auth"

export type BulkResult = { success: boolean; error?: string; affected?: number }

const MAX_BATCH = 200

function sanitizeIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return []
  return ids
    .filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 64)
    .slice(0, MAX_BATCH)
}

export async function bulkPublishProducts(ids: unknown): Promise<BulkResult> {
  const session = await getAdminSession()
  if (!session) return { success: false, error: "Non autorizzato" }

  const cleanIds = sanitizeIds(ids)
  if (cleanIds.length === 0) return { success: false, error: "Nessun prodotto selezionato" }

  const result = await prisma.product.updateMany({
    where: { id: { in: cleanIds } },
    data: { published: true },
  })

  revalidatePath("/admin/products")
  return { success: true, affected: result.count }
}

export async function bulkUnpublishProducts(ids: unknown): Promise<BulkResult> {
  const session = await getAdminSession()
  if (!session) return { success: false, error: "Non autorizzato" }

  const cleanIds = sanitizeIds(ids)
  if (cleanIds.length === 0) return { success: false, error: "Nessun prodotto selezionato" }

  const result = await prisma.product.updateMany({
    where: { id: { in: cleanIds } },
    data: { published: false },
  })

  revalidatePath("/admin/products")
  return { success: true, affected: result.count }
}

export async function bulkDeleteProducts(ids: unknown): Promise<BulkResult> {
  const session = await getAdminSession()
  if (!session) return { success: false, error: "Non autorizzato" }

  const cleanIds = sanitizeIds(ids)
  if (cleanIds.length === 0) return { success: false, error: "Nessun prodotto selezionato" }

  const usedInOrders = await prisma.orderItem.count({
    where: { productId: { in: cleanIds } },
  })
  if (usedInOrders > 0) {
    return {
      success: false,
      error: `${usedInOrders} ordine${usedInOrders === 1 ? "" : "i"} contiene${usedInOrders === 1 ? "" : "no"} prodotti selezionati. Disattiva la pubblicazione invece di eliminare.`,
    }
  }

  const result = await prisma.product.deleteMany({
    where: { id: { in: cleanIds } },
  })

  revalidatePath("/admin/products")
  return { success: true, affected: result.count }
}
