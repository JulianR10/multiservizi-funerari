# Mejoras — Petrungaro Multiservizi

> Análisis completo del proyecto con recomendaciones priorizadas.
> Basado en revisión de código y experiencia de usuario (Julio 2026).

---

## ⚠️ Pendiente - Stock y Precios

- [ ] **Stock oculto para usuarios no autenticados** — En product detail, si `showPrice=false`, no se muestra que el producto está agotado. Usuario se registra y descubre que no hay stock.
- [ ] **Track: usuarios logueados no ven órdenes guest** — La API busca por `userId`, no por `guestEmail`.

---

## 🛒 Pendiente - Checkout y Carrito

- [ ] **Checkout: error de envío enmascarado** — Si `/api/shipping-methods` falla, `shippingMethods` queda `[]` y shipping se muestra como gratuito.
- [ ] **Cart banner `?cancelled=true` falseable** — Cualquiera puede navegar a `/cart?cancelled=true` y ver el banner.
- [ ] **Cálculo de IVA en carrito** — Mostrar IVA y total estimado.
- [ ] **Costo de envío en carrito** — Estimar según método.

---

## 🌐 Pendiente - Navegación y Mobile

- [ ] **Dropdown categorías no funciona en touch** — Usa `group-hover`, no funciona en iPad/tablet.
- [ ] **Menú hover-only**: soporte táctil (click para abrir/cerrar).

---

## ♿ Pendiente - Accesibilidad

- [ ] **SearchResults sin `role="listbox"`** — No comunica selección por teclado a lectores de pantalla.
- [ ] **ImageGallery: sin navegación por flechas en thumbnails** — Solo Tab, no ArrowLeft/Right.
- [ ] **Añadir `aria-hidden="true"` en SVGs decorativos**.

---

## 🔍 Pendiente - SEO

- [ ] **Sin canonical link en `/products`** — Previene contenido duplicado con query params.
- [ ] **Sitemap dinámico**: incluir categorías y productos.
- [ ] **BreadcrumbList schema**: datos estructurados de migas de pan.
- [ ] **Metadata por categoría**: title/description por filtro.

---

## ⚡ Pendiente - Rendimiento

- [ ] **Skeleton de producto no coincide con layout real** — `Suspense` fallback es un div simple, pero la página es grid 2-columnas. Causa CLS.
- [ ] **Optimizar hero del landing**: usar `<Image priority>` en lugar de `backgroundImage` CSS.
- [ ] **Imágenes de servicios**: usar Next.js Image en lugar de `<img>` directo.

---

## 🔐 Pendiente - Seguridad

- [ ] **Rate limiter in-memory (no efectivo en serverless)** — `checkRateLimit` usa Map por instancia. En Vercel, cada instancia tiene su propia memoria. Un atacante puede rotar instancias.
- [ ] **Track orders: cualquiera con un email ve los pedidos** — Solo rate limiting (10/min) protege la información. Considerar magic link.
- [ ] **Admin login: sin CAPTCHA ni bloqueo progresivo** — Solo rate limiting.

---

## 🧹 Pendiente - Código

- [ ] **`crypto.randomUUID().substring(0,4)` colisión factura** — Solo 4 hex chars = 65k combinaciones. Bajo volumen alto hay riesgo de duplicados.
- [ ] **`fetchOrders` usado antes de declaración** — `src/app/admin/orders/page.tsx:47` llama a `fetchOrders` antes de su declaración (línea 50). Reordenar.
- [ ] **Protección CSRF en rutas API**.
- [ ] **Evitar `as const` en queries Prisma**.
- [ ] **Hook personalizado `useClickOutside`**: lógica duplicada.

---

## 📦 Pendiente - Baja Prioridad

- [ ] **AddToCartButton: fetch falla silenciosamente** — No hay toast ni error cuando el fetch de producto falla.
- [ ] **Billing address sin validación en checkout** — Se puede enviar vacía.
- [ ] **formatPrice cent rounding en admin dashboard** — `Math.round()` para average order value.
- [ ] **Admin: sin refresh automático de datos** — Dashboard estático hasta recarga manual.
- [ ] **Admin: sin skeleton loading** — Solo texto "Caricamento...".
- [ ] **Admin orders: sin confirmación en cambio de estado** — Un clic cambia "shipped" a "pending" sin pregunta.
- [ ] **CSV export sin paginación** — Carga TODAS las órdenes en memoria.
- [ ] **Admin logout: página con delay de 1.5s** — Podría ser un botón directo.
- [ ] **Página de contacto dedicada (`/contatti`) no existe** — Footer enlaza a `/#contatti` (anchor en homepage).
- [ ] **Legal pages sin shared layout** — Duplican clases container.
- [ ] **Dati-societari: sin PEC ni teléfono** — Requisitos legales italianos.
- [ ] **Diseño system tokens**: usar variables CSS (`--color-chalk-dark`) en lugar de valores inline.
- [ ] **Iconos/ilustraciones en empty states** — Todos los estados vacíos son solo texto.
- [ ] **`prefers-reduced-motion` global** para animaciones de fade-in y checkmark.
- [ ] **Navegación con filtros**: usar `<button>` o `next/navigation` en lugar de `<a>` en pills de categorías.
- [ ] **Contador secuencial de facturas** — En lugar de random, usar un contador desde DB o Redis.
- [ ] **Hook `useHydration` automático** — Que `useCart` maneje la hidratación internamente sin exponer `_hydrated`.
- [ ] **View transition name único**: `view-transition-name: page-content` está en todos los `<main>`, podría causar conflictos.
- [ ] **Detect de conexión offline**: Mostrar aviso si el usuario está offline en lugar de fallos silenciosos.

---

## Checklist Pre-Producción

> **Nota**: Mantener este checklist para cuando se despliegue a producción.

- [ ] Reemplazar Stripe test keys por live keys
- [ ] Configurar webhook endpoint en Stripe Dashboard
- [ ] Cambiar `NEXT_PUBLIC_URL` al dominio real
- [ ] Verificar dominio en Resend y actualizar `EMAIL_FROM`
- [ ] Generar API key real de Resend
- [ ] Verificar email de contacto legal (`info@petrungaro-multiservizi.it` vs dominio real)
- [ ] Reemplazar rate limiter in-memory por Redis/Upstash para producción multi-instancia
- [ ] Probar flujo completo con tarjetas de prueba
- [ ] Revisar todas las variables de entorno
- [ ] Build de producción: `npm run build`
- [ ] Revisar que el `robots.txt` permita indexing en producción
- [ ] Configurar analytics