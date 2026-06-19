"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth"

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email e password richieste" }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password || user.role !== "admin") {
    return { error: "Credenziali non valide" }
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return { error: "Credenziali non valide" }
  }

  await createAdminSession(user.id, user.email)
}

export async function adminLogout() {
  await destroyAdminSession()
}
