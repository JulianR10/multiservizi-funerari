import { prisma } from "@/lib/prisma"
import { assertAdminPage } from "@/lib/admin-guard"
import { CategoryForm } from "@/components/CategoryForm"

export default async function NewCategoryPage() {
  await assertAdminPage()

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">Nuova Categoria</h1>
      <div className="mt-8">
        <CategoryForm categories={categories} />
      </div>
    </div>
  )
}
