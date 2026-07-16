import { headers } from "next/headers"

const ipMap = new Map<string, { count: number; resetAt: number }>()

const ONE_MINUTE = 60_000

/**
 * In-memory rate limiter.
 * NOTA: in ambiente serverless (Vercel) ogni istanza ha memoria propria,
 * per cui questo limiter non è efficace cross-instance in produzione.
 * Per produzione multi-instance: configurare Upstash Redis (UPSTASH_REDIS_REST_URL
 * e UPSTASH_REDIS_REST_TOKEN) — il limiter lo rileverà automaticamente.
 *
 * Per ora, per le route ad alto rischio (login, registrazione) si affianca
 * un lockout persistente tramite User.failedLoginAttempts / User.lockedUntil
 * in Prisma, che funziona anche cross-instance.
 */
export function checkRateLimit(
  ip: string,
  limit: number = 10,
  windowMs: number = ONE_MINUTE
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = ipMap.get(ip)

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}

export async function getClientIpFromHeaders(): Promise<string> {
  const h = await headers()
  const forwarded = h.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const real = h.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}

