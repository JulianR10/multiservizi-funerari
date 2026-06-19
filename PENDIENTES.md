# Pendientes — Petrungaro Multiservizi

## Stripe

- [ ] **Reemplazar test keys por live keys** en `.env.local` cuando pases a producción
  - `STRIPE_SECRET_KEY` → `sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
  - `STRIPE_WEBHOOK_SECRET` → `whsec_...` de producción
- [ ] **Configurar webhook endpoint en Stripe Dashboard** apuntando a `https://tudominio.com/api/stripe/webhook`
- [ ] Manejar más eventos de Stripe: `payment_intent.payment_failed`, `checkout.session.expired`, `charge.refunded`
- [ ] Stripe CLI ya no hará falta en producción (el webhook lo recibe Stripe directo)

## Email (Resend)

- [ ] **Crear cuenta en [resend.com](https://resend.com)**
- [ ] **Verificar un dominio** en Resend (ej: `multiservizifunerarisrl.com`)
- [ ] **Generar API key** y ponerla en `.env.local` → `RESEND_API_KEY=re_...`
- [ ] **Actualizar `EMAIL_FROM`** en `.env.local` con el dominio verificado
- [ ] Probar envío de email de confirmación de orden

## Por hacer (features)

- [ ] **Webhooks adicionales**: manejar `payment_intent.failed`, `charge.refunded`, `checkout.session.expired`
- [ ] **Panel de admin dashboard** (`/admin`) con resumen de ventas, órdenes recientes
- [ ] **Búsqueda de cliente en admin**: buscar órdenes por email, nombre, factura
- [ ] **PDF factura**: generar y adjuntar factura en PDF al email de confirmación

## Antes de producción

- [ ] Poner `NEXT_PUBLIC_URL` con el dominio real
- [ ] Probar flujo completo con tarjetas de prueba antes de pasar a live
- [ ] Revisar que todos los `.env` estén configurados correctamente
- [ ] Hacer build de producción: `npm run build`
