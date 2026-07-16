import Link from "next/link"
import Image from "next/image"
import { CartButton } from "./CartButton"
import { NavbarSearchTrigger } from "./NavbarSearchTrigger"
import { MobileMenu } from "./MobileMenu"
import { NavbarActiveSection } from "./NavbarActiveSection"
import { ScrollToTopLink } from "./ScrollToTopLink"
import { CatalogDropdown } from "./CatalogDropdown"
import { getCustomerSession } from "@/lib/customer-auth"
import logo from "@/assets/logo-transp.png"
import { getCategoriesWithChildren } from "@/lib/categories"

export async function Navbar() {
  const [categories, customerSession] = await Promise.all([
    getCategoriesWithChildren(),
    getCustomerSession(),
  ])

  return (
    <nav aria-label="Navigazione principale">
      <NavbarActiveSection />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <ScrollToTopLink href="/" className="flex items-center gap-2 shrink-0 cursor-pointer">
            <Image src={logo} alt="Petrungaro Multiservizi" width={160} height={96} className="h-auto w-32 md:w-36 lg:w-40" loading="eager" />
          </ScrollToTopLink>

        <div className="flex items-center gap-6">
          <Link href="/#servizi" className="hidden text-sm font-medium text-primary/80 hover:text-primary md:block">
            Servizi
          </Link>
          <CatalogDropdown categories={categories} />
          <NavbarSearchTrigger />
          <Link href="/#contatti" className="hidden text-sm font-medium text-primary/80 hover:text-primary md:block">
            Contatto
          </Link>
          <CartButton />
          {customerSession ? (
            <Link href="/account" className="hidden text-sm font-medium text-primary/80 hover:text-primary md:block">
              Account
            </Link>
          ) : (
            <Link href="/auth/login" className="hidden rounded-[7px] bg-primary px-4 py-1.5 text-sm font-medium text-chalk hover:bg-primary-hover md:block">
              Accedi
            </Link>
          )}
          <MobileMenu categories={categories} customerSession={!!customerSession} />
        </div>
      </div>
    </nav>
  )
}
