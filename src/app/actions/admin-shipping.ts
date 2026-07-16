"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getAdminSession } from "@/lib/admin-auth"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
}

export type ShippingResult = { success: boolean; error?: string }

export async function createShippingMethod(formData: {
  name: string
  description?: string
  price: number
  estimatedDaysMin?: number
  estimatedDaysMax?: number
  active?: boolean
}): Promise<ShippingResult> {
  const session = await getAdminSession()
  if (!session) return { success: false, error: "Non autorizzato" }

  const name = (formData.name || "").trim().slice(0, 100)
  if (!name) return { success: false, error: "Nome obbligatorio" }

  const price = Number(formData.price)
  if (Number.isNaN(price) || price < 0 || !Number.isInteger(price)) {
    return { success: false, error: "Prezzo non valido (centesimi interi >= 0)" }
  }

  const min = formData.estimatedDaysMin
  const max = formData.estimatedDaysMax
  if (min !== undefined && (Number.isNaN(min) || min < 0)) {
    return { success: false, error: "Giorni minimi non validi" }
  }
  if (max !== undefined && (Number.isNaN(max) || max < 0)) {
    return { success: false, error: "Giorni massimi non validi" }
  }
  if (min !== undefined && max !== undefined && max < min) {
    return { success: false, error: "I giorni massimi devono essere >= giorni minimi" }
  }

  const slug = slugify(name)
  const existing = await prisma.shippingMethod.findUnique({ where: { slug } })
  if (existing) {
    return { success: false, error: "Esiste già un metodo con questo nome" }
  }

  await prisma.shippingMethod.create({
    data: {
      name,
      slug,
      description: (formData.description || "").trim().slice(0, 500) || null,
      price,
      estimatedDaysMin: min ?? null,
      estimatedDaysMax: max ?? null,
      active: formData.active !== false,
    },
  })

  revalidatePath("/admin/shipping")
  revalidatePath("/api/shipping-methods")
  return { success: true }
}

export async function updateShippingMethod(
  id: string,
  formData: {
    name: string
    description?: string
    price: number
    estimatedDaysMin?: number
    estimatedDaysMax?: number
    active?: boolean
  }
): Promise<ShippingResult> {
  const session = await getAdminSession()
  if (!session) return { success: false, error: "Non autorizzato" }

  const existing = await prisma.shippingMethod.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Metodo non trovato" }

  const name = (formData.name || "").trim().slice(0, 100)
  if (!name) return { success: false, error: "Nome obbligatorio" }

  const price = Number(formData.price)
  if (Number.isNaN(price) || price < 0 || !Number.isInteger(price)) {
    return { success: false, error: "Prezzo non valido" }
  }

  const min = formData.estimatedDaysMin
  const max = formData.estimatedDaysMax
  if (min !== undefined && (Number.isNaN(min) || min < 0)) {
    return { success: false, error: "Giorni minimi non validi" }
  }
  if (max !== undefined && (Number.isNaN(max) || max < 0)) {
    return { success: false, error: "Giorni massimi non validi" }
  }
  if (min !== undefined && max !== undefined && max < min) {
    return { success: false, error: "Giorni massimi devono essere >= giorni minimi" }
  }

  const newSlug = slugify(name)
  if (newSlug !== existing.slug) {
    const collision = await prisma.shippingMethod.findUnique({ where: { slug: newSlug } })
    if (collision) {
      return { success: false, error: "Esiste già un metodo con questo nome" }
    }
  }

  await prisma.shippingMethod.update({
    where: { id },
    data: {
      name,
      slug: newSlug,
      description: (formData.description || "").trim().slice(0, 500) || null,
      price,
      estimatedDaysMin: min ?? null,
      estimatedDaysMax: max ?? null,
      active: formData.active !== false,
    },
  })

  revalidatePath("/admin/shipping")
  revalidatePath("/api/shipping-methods")
  return { success: true }
}

export async function deleteShippingMethod(id: string): Promise<ShippingResult> {
  const session = await getAdminSession()
  if (!session) return { success: false, error: "Non autorizzato" }

  const orderCount = await prisma.order.count({ where: { shippingMethodId: id } })
  if (orderCount > 0) {
    return {
      success: false,
      error: `Impossibile eliminare: ${orderCount} ordine${orderCount === 1 ? "" : "i"} usa${orderCount === 1 ? "" : "no"} questo metodo. Disattivalo invece di eliminarlo.`,
    }
  }

  await prisma.shippingMethod.delete({ where: { id } })
  revalidatePath("/admin/shipping")
  revalidatePath("/api/shipping-methods")
  return { success: true }
}

export async function toggleShippingMethodActive(
  id: string,
  active: boolean
): Promise<ShippingResult> {
  const session = await getAdminSession()
  if (!session) return { success: false, error: "Non autorizzato" }

  await prisma.shippingMethod.update({
    where: { id },
    data: { active },
  })

  revalidatePath("/admin/shipping")
  revalidatePath("/api/shipping-methods")
  return { success: true }
}
