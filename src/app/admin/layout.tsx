import Link from "next/link"
import Image from "next/image"
import logo from "@/assets/logo-transp.png"
import { assertAdminPage } from "@/lib/admin-guard"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await assertAdminPage()
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-chalk">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6">
            <Link href="/" className="shrink-0">
              <Image
                src={logo}
                alt="Petrungaro Multiservizi"
                width={100}
                height={60}
                className="h-auto w-20"
              />
            </Link>
            <Link href="/admin" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Dashboard
            </Link>
            <Link href="/admin/products" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Prodotti
            </Link>
            <Link href="/admin/categories" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Categorie
            </Link>
            <Link href="/admin/orders" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Ordini
            </Link>
            <Link href="/admin/users" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Richieste
            </Link>
          </nav>
          <Link
            href="/auth/logout"
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            Esci
          </Link>
        </div>
      </header>
      <main className="pt-4">{children}</main>
    </div>
  )
}
