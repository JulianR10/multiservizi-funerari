import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { CartButton } from "./CartButton"
import { NavbarSearchTrigger } from "./NavbarSearchTrigger"
import { MobileMenu } from "./MobileMenu"
import { getAdminSession } from "@/lib/admin-auth"
import logo from "@/assets/logo-transp.png"
import { cacheLife } from "next/cache"

async function getCategories() {
  'use cache'
  cacheLife('hours')

  return prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  })
}

export async function Navbar() {
  const [categories, admin] = await Promise.all([
    getCategories(),
    getAdminSession(),
  ])

  return (
    <nav>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src={logo} alt="Petrungaro Multiservizi" width={160} height={96} className="h-auto w-32 md:w-36 lg:w-40" loading="eager" />
          </Link>

        <div className="flex items-center gap-8">
          <a href="#chi-siamo" className="nav-underline hidden text-base font-medium text-primary/80 hover:text-primary md:block">
            Chi Siamo
          </a>
          <a href="#servizi" className="nav-underline hidden text-base font-medium text-primary/80 hover:text-primary md:block">
            Servizi
          </a>
          <div className="group relative hidden md:block">
            <Link
              href="/products"
              className="flex items-center gap-1 text-base font-medium text-primary/80 hover:text-primary"
            >
              Catalogo Prodotti
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-64 rounded-lg border border-zinc-200 bg-chalk py-2 shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              {categories.map((cat) => (
                <div key={cat.id} className="group/sub relative">
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="flex items-center justify-between px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    {cat.name}
                    {cat.children.length > 0 && (
                      <svg className="h-3 w-3 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>
                  {cat.children.length > 0 && (
                    <div className="invisible absolute left-full top-0 z-50 w-56 rounded-lg border border-zinc-200 bg-chalk py-2 shadow-lg opacity-0 transition-all group-hover/sub:visible group-hover/sub:opacity-100">
                      {cat.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.slug}`}
                          className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <a href="#contatti" className="nav-underline hidden text-base font-medium text-primary/80 hover:text-primary md:block">
            Contatti
          </a>
          <NavbarSearchTrigger />
          <Link href="/track" className="nav-underline hidden text-base font-medium text-primary/80 hover:text-primary md:block">
            Track ordine
          </Link>
          {admin && (
            <Link
              href="/admin/products"
              className="hidden text-xs font-medium text-primary/80 hover:text-primary md:block"
            >
              Admin
            </Link>
          )}
          <CartButton />
          <MobileMenu categories={categories} />
        </div>
      </div>
    </nav>
  )
}
