
# petrungaro-multiservizi

Proyecto Next.js con integración a Neon (PostgreSQL), Stripe, Resend y despliegue en Vercel.

## Stack
- Next.js (App Router, TypeScript, Tailwind CSS)
- Neon (PostgreSQL) vía Prisma
- Stripe (pagos)
- Resend (emails)
- Vercel (deploy)

## Estructura
- `/src/lib/prisma.ts`: Cliente Prisma para Neon
- `/src/lib/stripe.ts`: Cliente Stripe
- `/src/lib/resend.ts`: Cliente Resend
- `/prisma/schema.prisma`: Modelos de base de datos
- `.env.local`: Variables de entorno
- `vercel.json`: Configuración para Vercel

## Primeros pasos
1. Configura las variables en `.env.local`.
2. Define tus modelos en `prisma/schema.prisma`.
3. Ejecuta migraciones:
	```bash
	npx prisma migrate dev
	```
4. Inicia el servidor de desarrollo:
	```bash
	npm run dev
	```

## Despliegue
- Sube el código a GitHub y conecta el repo a Vercel.
- Configura las variables de entorno en Vercel.

---

> Reemplaza los valores de las variables de entorno por los reales de tus servicios.
