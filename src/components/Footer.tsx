import Link from "next/link"
import { CopyrightYear } from "./CopyrightYear"
import { ScrollToTopLink } from "./ScrollToTopLink"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-chalk/20 bg-primary shadow-[0_-3px_8px_2px_rgba(0,0,0,0.12)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          <div className="hidden sm:block">
            <ScrollToTopLink href="/" className="text-sm font-semibold text-chalk cursor-pointer hover:text-chalk/80 transition-colors">
              Petrungaro Multiservizi
            </ScrollToTopLink>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-chalk">Link utili</h3>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <li>
                <Link href="/termini" className="inline-block text-xs text-chalk/70 hover:text-chalk">
                  Termini e condizioni
                </Link>
              </li>
              <li>
                <Link href="/recesso" className="inline-block text-xs text-chalk/70 hover:text-chalk">
                  Diritto di recesso
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="inline-block text-xs text-chalk/70 hover:text-chalk">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="inline-block text-xs text-chalk/70 hover:text-chalk">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/dati-societari" className="inline-block text-xs text-chalk/70 hover:text-chalk">
                  Dati societari
                </Link>
              </li>
              <li>
                <Link href="/contatti" className="inline-block text-xs text-chalk/70 hover:text-chalk">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>

        </div>
        <div className="mt-8 border-t border-chalk/10 pt-6 text-center">
          <p className="text-xs text-chalk/50"><CopyrightYear /> Petrungaro Multiservizi. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  )
}
