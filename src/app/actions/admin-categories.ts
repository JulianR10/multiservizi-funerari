"use server"

import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/format"
import { revalidatePath } from "next/cache"
import { getAdminSession } from "@/lib/admin-auth"

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function assertAdmin(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
    orderBy: { name: "asc" },
  })
}

export async function upsertCategory(data: {
  id?: string
  name: string
  image?: string | null
  parentId?: string | null
}): Promise<ActionResult> {
  if (!(await assertAdmin())) {
    return { success: false, error: "Non autorizzato" }
  }

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    return { success: false, error: "Nome richiesto" }
  }

  const slug = slugify(data.name)

  if (data.id) {
    const existing = await prisma.category.findUnique({ where: { id: data.id } })
    if (!existing) return { success: false, error: "Categoria non trovata" }

    if (data.parentId === data.id) {
      return { success: false, error: "Una categoria non può essere padre di sé stessa" }
    }

    await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        slug,
        image: data.image || null,
        parentId: data.parentId || null,
      },
    })
  } else {
    await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug,
        image: data.image || null,
        parentId: data.parentId || null,
      },
    })
  }

  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true, data: undefined }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) {
    return { success: false, error: "Non autorizzato" }
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true, children: true } } },
  })

  if (!category) return { success: false, error: "Categoria non trovata" }

  if (category._count.products > 0) {
    return { success: false, error: `Impossibile eliminare: ${category._count.products} prodotti associati` }
  }

  if (category._count.children > 0) {
    return { success: false, error: `Impossibile eliminare: ${category._count.children} sottocategorie presenti` }
  }

  await prisma.category.delete({ where: { id } })
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true, data: undefined }
}
