import { prisma } from "./prisma"

export type CategoryWithChildren = {
  id: string
  name: string
  slug: string
  children: { id: string; name: string; slug: string }[]
}

export type CategoryWithCount = CategoryWithChildren & { _count: { products: number } }

export type CategoryWithPreview = CategoryWithCount & { previewImage: string | null }

export async function getCategoriesWithChildren(): Promise<CategoryWithChildren[]> {
  return prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  })
}

export async function getCategoriesWithPreviews(): Promise<CategoryWithPreview[]> {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: { orderBy: { name: "asc" } },
      _count: { select: { products: { where: { published: true } } } },
    },
    orderBy: { name: "asc" },
  })

  const categoryIds = categories.map((c) => c.id)
  const products = await prisma.product.findMany({
    where: { categoryId: { in: categoryIds }, published: true, images: { isEmpty: false } },
    orderBy: { createdAt: "desc" },
    select: { categoryId: true, images: true },
  })

  const imageMap = new Map<string, string>()
  for (const p of products) {
    if (!imageMap.has(p.categoryId) && p.images.length > 0) {
      imageMap.set(p.categoryId, p.images[0])
    }
  }

  return categories.map((cat) => ({
    ...cat,
    previewImage: imageMap.get(cat.id) || null,
  }))
}
