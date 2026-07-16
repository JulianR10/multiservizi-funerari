# Deploy — Petrungaro Multiservizi

## Pre-requisites

1. **Account Vercel** (hobby plan, $0)
2. **Neon database** (free tier)
3. **Stripe account** (test mode for now)
4. **Resend account** (free: 100 emails/day)
5. **Upstash Redis** (free tier, for rate limiting)
6. **Vercel Blob** (free: 500 MB)

## Environment Variables (Vercel Dashboard → Project Settings → Environment Variables)

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://...` da Neon |
| `STRIPE_SECRET_KEY` | `sk_test_...` o `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `RESEND_API_KEY` | `re_...` |
| `EMAIL_FROM` | `Petrungaro Multiservizi <onboarding@resend.dev>` (cambiare dopo verifica dominio) |
| `NEXT_PUBLIC_URL` | `https://multiservizifunerarisrl.com` (dominio reale) |
| `ADMIN_NOTIFY_EMAIL` | Email admin per notifiche nuovi ordini |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `FREE_SHIPPING_THRESHOLD` | `15000` (in centesimi) |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | `15000` |
| `UPSTASH_REDIS_REST_URL` | Da Upstash Console |
| `UPSTASH_REDIS_REST_TOKEN` | Da Upstash Console |
| `BLOB_READ_WRITE_TOKEN` | Da Vercel Blob Store |

## Pre-Deploy Checklist

### Stripe
- [ ] Stripe test keys → live keys in `STRIPE_SECRET_KEY`
- [ ] Configura webhook in Stripe Dashboard:
  - Endpoint: `https://multiservizifunerarisrl.com/api/stripe/webhook`
  - Events: `checkout.session.completed`, `charge.refunded`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.expired`
- [ ] Webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### Resend
- [ ] Verifica dominio in Resend (aggiungi record DNS)
- [ ] Aggiorna `EMAIL_FROM` con dominio verificato
- [ ] Genera API key produzione → `RESEND_API_KEY`

### Dominio
- [ ] Aggiungi dominio in Vercel Dashboard (multiservizifunerarisrl.com)
- [ ] Configura record DNS (CNAME o NS)
- [ ] Aggiorna `NEXT_PUBLIC_URL`
- [ ] Verifica SSL (Vercel lo fa automaticamente)

### Database
- [ ] Crea database su Neon (produzione, non usare lo stesso del dev)
- [ ] Esegui migrazioni: `npx prisma migrate deploy`

### Storage
- [ ] Crea Blob Store in Vercel Dashboard → Storage → Create Blob Store
- [ ] Copia `BLOB_READ_WRITE_TOKEN`

### Rate Limiting
- [ ] Crea database Redis in Upstash Console (free tier)
- [ ] Copia `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`

### Verifiche finali
- [ ] `npm run build` (locale, verificare 0 errori)
- [ ] `robots.txt` permette indexing (già configurato)
- [ ] Configura analytics (es. Vercel Analytics, Google Analytics 4)
- [ ] Test flusso completo con carte di prova Stripe (`4242 4242 4242 4242`)
- [ ] Verifica email conferma ordine arriva
- [ ] Verifica notifica admin arriva
- [ ] Test login admin + B2B
- [ ] Verifica rate limiting funziona (troppe richieste → 429)
- [ ] Test upload immagini prodotto (Vercel Blob)
- [ ] Test download fattura PDF
- [ ] Test tracking ordini via email

## Deploy Steps

```bash
# 1. Ultimo commit
git add -A
git commit -m "chore: pre-deploy preparation"

# 2. Push a GitHub
git push origin main

# 3. Vercel: importa il repo da GitHub
#    - Framework: Next.js
#    - Build command: npx prisma generate && next build
#    - Output directory: .next
#    - Environment variables: tutte le variabili sopra

# 4. In Vercel Dashboard → Deployments
#    - Attendi build
#    - Verifica deployment log per errori

# 5. Stripe webhook (solo dopo deploy riuscito)
#    - Vai a Stripe Dashboard → Webhooks → Add endpoint
#    - URL: https://multiservizifunerarisrl.com/api/stripe/webhook
#    - Seleziona eventi come sopra
#    - Copia signing secret in Vercel env vars

# 6. Post-deploy
#    - Visita il sito
#    - Crea ordine di test
#    - Verifica tutto funziona
```

## Cron Jobs / Background Tasks

Nessuno per ora. Se in futuro serviranno:
- **Spedizioni**: notifica a corriere (integrare dopo aver scelto corriere)
- **Invoice numbering**: contatore sequenziale (usare Redis o DB)

## Rollback

```bash
# Vercel: Deployments → ... → Promote to Production (versione precedente)

# Database: restore da backup Neon o eseguire migration down
npx prisma migrate down
```
