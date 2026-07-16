# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Stock indicator: "Disponibile" / "Solo X rimasti" badge on ProductCard and ProductDetail
- `generateMetadata` with title, description, and OG tags on `/products`
- `assertAdminPage()` guard on admin layout, covering all admin routes
- Cart link in MobileMenu for mobile users
- Early return with "Carrello vuoto" + link on checkout when cart is empty

### Fixed
- Ordine-confermato error handling: differentiated error states with link to `/track`
- CookieBanner: removed misleading "Rifiuta" button (only technical cookies used)
- `CartButton` now visible on all screen sizes (was `hidden md:block`)

### Changed
- Expanded legal pages (termini, recesso, privacy) with full Italian law-compliant sections (GDPR, D.Lgs. 21/2014, modulo di recesso)

## [Initial Development] — 2026-07

### Added
- B2B registration flow (PENDING/APPROVED/REJECTED), admin approve/reject
- Price hiding for non-APPROVED users
- ProductCard / ProductDetail showPrice prop
- CategoryGrid redesign (no sidebar)
- Category background images
- Checkout refactor (AddressForm, OrderSummary, ShippingMethodSelector)
- Email templates refactor (emailLayout, itemsTableHtml, totalsHtml)
- Focus traps (CartSlideOver, MobileMenu)
- Rate limiting (register, checkout, admin login)
- Navbar visible on auth pages (fixed HideOnAdmin)
- Customer login blindado (only role=user allowed)
- Server-side APPROVED guard in checkout API
- Real P.IVA on privacy page
- Static "ultimo aggiornamento" on cookies page
- Removed empty "Seguici" from footer, `#contatti` with Link
- CookieBanner hidden on admin pages
- Checkout button in cart
- +/- buttons with aria-label
- Quantity=1 no longer removes item (minus stops at 1)
- Removed loading.tsx checkout (dead code)
- Focus management + hydration guard in CartSlideOver
