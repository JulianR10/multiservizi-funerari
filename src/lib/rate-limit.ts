import { headers } from "next/headers"
import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

const ONE_MINUTE = 60_000

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  reset?: number
  backend: "upstash" | "memory"
}

let _upstash:
  | { redis: Redis; limiters: Map<string, Ratelimit> }
  | null = null

function getUpstash() {
  if (_upstash) return _upstash
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  _upstash = {
    redis: new Redis({ url, token }),
    limiters: new Map(),
  }
  return _upstash
}

function getLimiter(name: string, limit: number, windowMs: number): Ratelimit | null {
  const u = getUpstash()
  if (!u) return null
  const key = `${name}:${limit}:${windowMs}`
  let limiter = u.limiters.get(key)
  if (limiter) return limiter
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
  limiter = new Ratelimit({
    redis: u.redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: false,
    prefix: `rl:${name}`,
  })
  u.limiters.set(key, limiter)
  return limiter
}

const memoryMap = new Map<string, { count: number; resetAt: number }>()

function memoryCheck(
  ip: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const entry = memoryMap.get(ip)

  if (!entry || now > entry.resetAt) {
    memoryMap.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, backend: "memory" }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: entry.resetAt, backend: "memory" }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, backend: "memory" }
}

export function checkRateLimit(
  ip: string,
  limit: number = 10,
  windowMs: number = ONE_MINUTE
): RateLimitResult {
  const upstash = getUpstash()
  if (!upstash) {
    return memoryCheck(ip, limit, windowMs)
  }
  return memoryCheck(ip, limit, windowMs)
}

export async function checkRateLimitAsync(
  identifier: string,
  limit: number = 10,
  windowMs: number = ONE_MINUTE
): Promise<RateLimitResult> {
  const limiter = getLimiter("default", limit, windowMs)
  if (!limiter) {
    return memoryCheck(identifier, limit, windowMs)
  }

  try {
    const { success, remaining, reset } = await limiter.limit(identifier)
    return {
      allowed: success,
      remaining,
      reset: typeof reset === "number" ? reset : undefined,
      backend: "upstash",
    }
  } catch (err) {
    console.error("[RATELIMIT] Upstash error, falling back to memory:", err)
    return memoryCheck(identifier, limit, windowMs)
  }
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
