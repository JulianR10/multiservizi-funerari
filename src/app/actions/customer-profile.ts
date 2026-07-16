"use server"

import { prisma } from "@/lib/prisma"
import { getCustomerSession } from "@/lib/customer-auth"
import { validateItalianVat, isValidEmail } from "@/lib/validators"
import { revalidatePath } from "next/cache"

const MAX_FIELD = 200

function trim(v: unknown, max = MAX_FIELD): string {
  if (typeof v !== "string") return ""
  return v.trim().slice(0, max)
}

export type CompanyProfileResult = {
  success: boolean
  error?: string
  field?: string
}

export async function updateCompanyProfile(formData: {
  companyName: string
  vatNumber: string
  taxCode: string
  sdiCode: string
  legalForm: string
  businessType: string
  phone: string
  city: string
  province: string
  address: string
  postalCode: string
  notes: string
}): Promise<CompanyProfileResult> {
  const session = await getCustomerSession()
  if (!session) {
    return { success: false, error: "Devi effettuare l'accesso." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { status: true, role: true },
  })

  if (!user || user.role !== "user") {
    return { success: false, error: "Non autorizzato." }
  }

  if (user.status !== "APPROVED") {
    return { success: false, error: "Il tuo account non è ancora abilitato alla modifica." }
  }

  const companyName = trim(formData.companyName)
  if (!companyName) {
    return { success: false, field: "companyName", error: "Ragione sociale obbligatoria." }
  }

  const vatNumber = trim(formData.vatNumber, 16)
  const vatError = validateItalianVat(vatNumber)
  if (vatError) {
    return { success: false, field: "vatNumber", error: vatError }
  }

  const sdiCode = trim(formData.sdiCode, 16)
  if (sdiCode && !/^[A-Z0-9]{6,7}$/i.test(sdiCode)) {
    return {
      success: false,
      field: "sdiCode",
      error: "Codice destinatario non valido (6-7 caratteri alfanumerici).",
    }
  }

  const taxCode = trim(formData.taxCode, 16)

  const phone = trim(formData.phone, 30)
  if (!phone) {
    return { success: false, field: "phone", error: "Telefono obbligatorio." }
  }

  const city = trim(formData.city, 80)
  const province = trim(formData.province, 4).toUpperCase()
  const address = trim(formData.address, 200)
  const postalCode = trim(formData.postalCode, 10)
  const legalForm = trim(formData.legalForm, 32)
  const businessType = trim(formData.businessType, 32)
  const notes = trim(formData.notes, 1000)

  if (!city || !address || !postalCode) {
    return { success: false, error: "Indirizzo, città e CAP sono obbligatori." }
  }

  if (province && !/^[A-Z]{2}$/.test(province)) {
    return { success: false, field: "province", error: "Provincia non valida (es. CZ, CS)." }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: companyName,
      companyName,
      vatNumber,
      taxCode: taxCode || null,
      sdiCode: sdiCode || null,
      legalForm: legalForm || null,
      businessType: businessType || null,
      phone,
      city,
      province,
      address,
      postalCode,
      notes: notes || null,
    },
  })

  revalidatePath("/account/profile")
  revalidatePath("/account")
  return { success: true }
}

export async function changePassword(formData: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<CompanyProfileResult> {
  const session = await getCustomerSession()
  if (!session) {
    return { success: false, error: "Devi effettuare l'accesso." }
  }

  const current = formData.currentPassword
  const next = formData.newPassword
  const confirm = formData.confirmPassword

  if (!current || !next || !confirm) {
    return { success: false, error: "Tutti i campi sono obbligatori." }
  }

  if (next.length < 8) {
    return {
      success: false,
      field: "newPassword",
      error: "La nuova password deve essere di almeno 8 caratteri.",
    }
  }

  if (next !== confirm) {
    return { success: false, field: "confirmPassword", error: "Le password non coincidono." }
  }

  if (next === current) {
    return {
      success: false,
      field: "newPassword",
      error: "La nuova password deve essere diversa da quella attuale.",
    }
  }

  const bcrypt = await import("bcryptjs")
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { password: true },
  })

  if (!user?.password) {
    return { success: false, error: "Account non valido." }
  }

  const valid = await bcrypt.compare(current, user.password)
  if (!valid) {
    return { success: false, field: "currentPassword", error: "Password attuale non corretta." }
  }

  const hashed = await bcrypt.hash(next, 12)
  await prisma.user.update({
    where: { id: session.userId },
    data: { password: hashed },
  })

  return { success: true }
}

export async function updateContactEmail(
  newEmail: string
): Promise<CompanyProfileResult> {
  const session = await getCustomerSession()
  if (!session) {
    return { success: false, error: "Devi effettuare l'accesso." }
  }

  if (!isValidEmail(newEmail)) {
    return { success: false, field: "email", error: "Email non valida." }
  }

  const lower = newEmail.toLowerCase()
  if (lower === session.email?.toLowerCase()) {
    return { success: true }
  }

  const existing = await prisma.user.findUnique({ where: { email: lower } })
  if (existing && existing.id !== session.userId) {
    return { success: false, field: "email", error: "Email già utilizzata da un altro account." }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { email: lower },
  })

  revalidatePath("/account")
  revalidatePath("/account/profile")
  return { success: true }
}
