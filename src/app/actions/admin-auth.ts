"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth"
import { checkRateLimitAsync, getClientIpFromHeaders } from "@/lib/rate-limit"

const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

export async function adminLogin(formData: FormData) {
  const identifier = formData.get("email") as string
  const password = formData.get("password") as string

  if (!identifier || !password) {
    return { error: "Username/email e password richieste" }
  }

  const ip = await getClientIpFromHeaders()
  const rateCheck = await checkRateLimitAsync(`login:${ip}`, 5, 60_000)
  if (!rateCheck.allowed) {
    return { error: "Troppi tentativi. Riprova tra un minuto." }
  }

  const user =
    (await prisma.user.findUnique({ where: { email: identifier } })) ??
    (await prisma.user.findUnique({ where: { username: identifier } }))

  if (!user || !user.password || user.role !== "admin") {
    return { error: "Credenziali non valide" }
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60)
    return { error: `Account bloccato. Riprova tra ${remaining} minuti.` }
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    const attempts = user.failedLoginAttempts + 1
    const update: Record<string, unknown> = { failedLoginAttempts: attempts }
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      update.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS)
    }
    await prisma.user.update({ where: { id: user.id }, data: update })
    return { error: "Credenziali non valide" }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  })

  await createAdminSession(user.id, user.email)
}

export async function adminLogout() {
  await destroyAdminSession()
}
