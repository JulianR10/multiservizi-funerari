# Petrungaro Multiservizi — Project Documentation

## Description

Italian e-commerce for a funeral services company. Sells funeral ceramics, headstones, memorial products, and related items.

**Domain**: multiservizifunerarisrl.com

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Webpack) |
| UI | React 19, Tailwind CSS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Payments | Stripe (Checkout Sessions) |
| Emails | Resend |
| Cart | Zustand + localStorage |
| Admin Auth | JWT (cookie `admin_session`, httpOnly, 24h) |
| Customer Auth | JWT (cookie `customer_session`, httpOnly, 7d) |
| Charts | Recharts |
| PDF | jsPDF + jsPDF-AutoTable |
| Deploy | Vercel |

---

## Brand & Design System

- **Primary color**: `#772123` (wine red / garnet)
- **Hover color**: `#5f1b1d`
- **Background**: `#F5F0EB` (chalk)
- **Darkened background**: `#EDE5DD` (chalk-dark)
- **Headings font**: Cormorant Garamond (elegant serif, classic, Italian)
- **Body font**: Lato (clean sans-serif, screen-friendly)
- **Visual style**: warm, serious, dignified, elegant

### Communication tone
- Respectful, dignified, warm, empathetic
- The user is in a delicate moment
- No confetti, celebrations, sounds, aggressive urgency, or "share on social media"
- Subtle animations (opacity, smooth translateY)
- Formal yet warm messages in Italian

---

## Project Structure

```
src/
├── app/              # Routes (App Router)
├── assets/           # Images, fonts, etc.
├── components/       # React components
├── generated/        # Prisma Client generated
├── hooks/            # Custom hooks
├── lib/              # Utilities (prisma, stripe, resend, auth, tax, orders)
├── middleware.ts     # Next.js middleware
└── types/            # TypeScript types
data/                  # Product catalog reference data
prisma/                # Prisma schema, seed, migrations
public/images/products/ # Product images (webp, 800px, q80)
scripts/               # Build / QA scripts
  convert-to-webp.mjs  # Batch image converter
  qa-test.mjs          # Playwright QA test suite
```

### Main routes
- `/` — Landing (Hero + Chi Siamo + Stats + Servizi + Contatti)
- `/prodotti` — Catalog with CategoryGrid + search
- `/prodotti/[slug]` — Product detail
- `/carrello` — Cart
- `/checkout` — Shipping form + Stripe redirect
- `/ordine-confermato` — Post-payment success page
- `/track` — Order tracking by email
- `/account` — Customer account (logged in)
- `/auth/login` — Unified login (customer + admin tabs)
- `/auth/register` — B2B registration (full form with company data)
- `/auth/richiesta-inviata` — Post-registration confirmation (PENDING)
- `/admin` — Dashboard with charts
- `/admin/products` — Product management (admin)
- `/admin/orders` — Order management with search (admin)
- `/admin/orders/[id]` — Order detail with PDF invoice download
- `/admin/users` — B2B registration requests (approve/reject)
- `/termini`, `/privacy`, `/cookies`, `/recesso`, `/dati-societari` — Legal pages

---

## Database (Prisma)

### Main models
- **User**: Registered users (email, username, role, password)
- **Category**: Categories with hierarchy (parentId)
- **Product**: Products with price, stock, images, metadata
- **Order**: Orders with items, shipping, billing, tracking
- **OrderItem**: Items for each order
- **Address**: Shipping/billing addresses
- **ShippingMethod**: Shipping methods with price and estimate

### Key Order fields
- `guestEmail` — Customer email (unregistered)
- `userId` — FK to registered user (optional)
- `stripePaymentId` / `stripePaymentIntentId` — Stripe IDs
- `stripeCustomerId` — Stripe customer ID
- `status` — Order status (pending, confirmed, shipped, delivered, cancelled)
- `paymentStatus` — Payment status (pending, paid, refunded, partially_refunded)
- `trackingNumber` / `trackingUrl` — Shipping tracking
- `invoiceNumber` — Invoice number (FATT-YYYYMMDD-XXXX)
- `tax` — VAT (22% fixed)

---

## Key Features

### Payments & Orders
- Stripe Checkout Sessions with 22% fixed VAT
- Stripe webhooks: `checkout.session.completed`, `charge.refunded`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.expired`
- Free shipping above threshold (`NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` in `.env`, in centesimi)
- Automatic Stripe Customer creation on webhook
- Partial and full refunds from admin panel

### Cart & Search
- Persistent cart with Zustand + localStorage
- Search with debounce (150ms) + keyboard navigation
- Product caching with `'use cache'` + `cacheLife`

### Invoicing
- PDF invoice generation (jsPDF) with company data
- Invoice attached automatically to confirmation email
- Invoice download from admin panel

### Authentication
- Admin: JWT (cookie `admin_session`, httpOnly, 24h, role `admin`)
- B2B customers: JWT (cookie `customer_session`, httpOnly, 7d, role `user`)
- B2B registration with full form (ragione sociale, P.IVA, SDI, legal form, business type)
- User status: `PENDING` → `APPROVED` / `REJECTED` (admin decides via `/admin/users`)
- Prices hidden for non-APPROVED users
- Login checks status: PENDING error, REJECTED error, APPROVED normal login
- Automatic guest order linking on registration

### Admin
- Dashboard with charts (Recharts): 30-day revenue, order status breakdown
- Order search by email, name, invoice (frontend)
- Order management: status, tracking, refunds
- CSV order export

### Emails (Resend)
- Order confirmation (with PDF invoice attached)
- New order notification to admin
- Refund notification to customer
- Shipping confirmation with tracking
- Password reset

### Security
- Rate limiting: tracking API (10 req/min per IP)
- Rate limiting: admin login (5 req/min per IP) + lockout 5 intentos / 15 min
- Rate limiting: B2B login (5 req/min per IP) + lockout 5 intentos / 15 min
- Rate limiting: B2B registration (5 req/min per IP)
- Password hashing with bcrypt (12 rounds)
- Admin login: only `role: "admin"` allowed
- Customer login: only `role: "user"` allowed (admin isolated)
- Checkout API: server-side guard for `status: "APPROVED"`

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_xxx
EMAIL_FROM=Petrungaro Multiservizi <onboarding@resend.dev>

# App
NEXT_PUBLIC_URL=http://localhost:3000
AUTH_SECRET=...

# Shipping
FREE_SHIPPING_THRESHOLD=15000
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=15000
```

---

## Local Setup

```bash
git clone <repo>
npm install
npx prisma generate
# Copy .env.example to .env and fill values
npm run dev
```

## Code Conventions

- **Naming**: camelCase for variables/functions, PascalCase for components/types, snake_case for DB columns
- **Components**: one component per file, named export
- **Imports**: React/Next → external libraries → components → lib → types → assets
- **Typing**: avoid `any`, prefer `type` over `interface` for props
- **Language**: UI and comments in Italian; code (variables, functions) in English
- **Commits**: conventional commits in English (`feat:`, `fix:`, `refactor:`, `chore:`)
- **Branches**: `feature/<name>`, `fix/<name>`, `chore/<name>`

## Database workflow

Prisma 7+ uses `prisma.config.ts` to read `DATABASE_URL`. The config loads
`.env` first then `.env.local` (override) — so secrets can live in
`.env.local` (gitignored) while `.env` (also gitignored) is used for
shared/non-secret defaults.

```bash
# Daily dev — auto-applies any pending migration before starting
npm run dev

# After editing prisma/schema.prisma (creates a new migration interactively)
npm run db:migrate

# Manual status check / apply
npm run db:status
npm run db:migrate:deploy

# Open Prisma Studio
npm run db:studio
```

**Important**: any new migration under `prisma/migrations/` MUST be
applied locally before the app works, because Next.js code references
new tables/columns immediately. The `predev` hook handles this
automatically. In production, run `npx prisma migrate deploy` (or wire
it as a prebuild hook in `package.json`) before/with the deploy.

## Testing

Not yet implemented. See `mejoras.md` for priorities.

## Pre-Production Checklist

See `mejoras.md` → Pre-Production Checklist (12 items).

---

## Session State (last session: July 2026)

### Recent changes
- 143 products in `articoli-funebri` (35 with `metadata.variants` — size, color, finish, brand)
- Tax & payment utilities centralized: `computeTax()`, `computeSubtotal()`, `validateStock()` in `lib/tax.ts` and `lib/order-utils.ts`
- Dead code removed: `CategorySidebar.tsx`, `FormattedDate`, `getCategoriesWithCounts`, `flattenCategories`
- Navbar: "Servizi" + "Contatto" links added, "Accedi" styled as primary button, cart hidden when empty
- Contact section: WhatsApp numbers in horizontal pills
- 321 product images converted to webp (800px, q80) in `public/images/products/`

### Test users
- Admin: `admin@petrungaro.it` / `admin123`
- B2B APPROVED: `rossi@test.it` / `test1234` (Onoranze Funebri Rossi)

### Product catalog status
- `data/articoli-funebri.md` — original 204 names, consolidated to 143 products in DB
- Prices: **pending**
- Descriptions: **pending**
- 25 `_DSC` images pending rename + mapping
- Other categories (Linea Marmi, Accessori Cimiteriali, Fotoceramiche): **empty**

### What's pending
See `mejoras.md` for the full prioritized list.

---

*Last updated: July 2026*
