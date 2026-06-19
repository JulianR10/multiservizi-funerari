import Link from "next/link"
import { CopyrightYear } from "./CopyrightYear"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-chalk/20 bg-primary shadow-[0_-3px_8px_2px_rgba(0,0,0,0.12)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          <div className="hidden sm:block">
            <h3 className="text-sm font-semibold text-chalk">Petrungaro Multiservizi</h3>
            <p className="mt-2 text-xs text-chalk/70">
              Il tuo negozio di fiducia per servizi e prodotti di qualità.
            </p>
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
                <a href="#contatti" className="inline-block text-xs text-chalk/70 hover:text-chalk">
                  Contatti
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-chalk">Seguici</h3>
            <div className="mt-3 flex justify-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-chalk/60 hover:text-chalk transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-chalk/60 hover:text-chalk transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.11 2.525c.636-.247 1.363-.416 2.427-.465C8.83 2.013 9.185 2 11.615 2h.7zm-.08 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-chalk/10 pt-6 text-center">
          <p className="text-xs text-chalk/50"><CopyrightYear /> Petrungaro Multiservizi. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  )
}
