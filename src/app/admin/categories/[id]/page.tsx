import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { assertAdminPage } from "@/lib/admin-guard"
import { CategoryForm } from "@/components/CategoryForm"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  await assertAdminPage()
  const { id } = await params

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) notFound()

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">Modifica Categoria</h1>
      <p className="mt-1 text-sm text-zinc-500">{category.name}</p>
      <div className="mt-8">
        <CategoryForm
          category={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            image: category.image,
            parentId: category.parentId,
          }}
          categories={categories}
        />
      </div>
    </div>
  )
}
