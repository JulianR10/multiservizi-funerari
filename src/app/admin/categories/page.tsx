import Link from "next/link"
import { getCategories } from "@/app/actions/admin-categories"
import { assertAdminPage } from "@/lib/admin-guard"
import { DeleteCategoryButton } from "./delete-button"

type CategoryWithCount = {
  id: string
  name: string
  image: string | null
  slug: string
  parentId: string | null
  parent: { id: string; name: string } | null
  _count: { products: number; children: number }
}

export default async function AdminCategoriesPage() {
  await assertAdminPage()

  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Gestione Categorie</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nuova categoria
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">Categoria padre</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase text-zinc-500">Prodotti</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-zinc-500">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-chalk">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-400">
                  Nessuna categoria.{" "}
                  <Link href="/admin/categories/new" className="font-medium text-primary hover:text-primary-hover">
                    Crea la prima
                  </Link>
                </td>
              </tr>
            ) : (
              categories.map((cat: CategoryWithCount) => (
                <tr key={cat.id} className="hover:bg-zinc-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900">
                    {cat.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                    {cat.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                    {cat.parent?.name || <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-zinc-500">
                    {cat._count.products}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="font-medium text-zinc-900 hover:text-zinc-600"
                    >
                      Modifica
                    </Link>
                    <DeleteCategoryButton
                      categoryId={cat.id}
                      categoryName={cat.name}
                      hasProducts={cat._count.products > 0}
                      hasChildren={cat._count.children > 0}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
