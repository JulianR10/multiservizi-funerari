"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createCustomerSession, destroyCustomerSession } from "@/lib/customer-auth"
import { cookies } from "next/headers"
import { sendEmail } from "@/lib/email"
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit"
import { COMPANY } from "@/lib/company"
import { validateItalianVat } from "@/lib/validators"

const ADMIN_EMAIL = process.env.EMAIL_FROM || COMPANY.email

const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "La password deve essere di almeno 8 caratteri."
  return null
}

const LEGAL_FORMS: Record<string, string> = {
  SRL: "Società (SRL o SRLS)",
  SAS: "Società (SAS, SNC)",
  COOPERATIVA: "Cooperativa",
  DITTA_INDIVIDUALE: "Ditta Individuale",
  ALTRO: "Altro",
}

const BUSINESS_TYPES: Record<string, string> = {
  ONORANZE_FUNEBRI: "Onoranze Funebri",
  COSTRUTTORE: "Costruttore/Rivenditore Cofani Funebri",
  MARMISTA: "Marmista",
  FIORISTA: "Fiorista",
  ALTRO: "Altro",
}

type RegisterData = {
  email: string
  confirmEmail: string
  password: string
  confirmPassword: string
  companyName: string
  vatNumber: string
  taxCode: string
  sdiCode: string
  legalForm: string
  businessType: string
  city: string
  province: string
  address: string
  postalCode: string
  phone: string
  notes: string
}

export async function registerCustomer(formData: RegisterData): Promise<{ success: boolean; error?: string }> {
  const ip = await getClientIpFromHeaders()
  const rateCheck = checkRateLimit(`register:${ip}`, 5, 60_000)
  if (!rateCheck.allowed) {
    return { success: false, error: "Troppe richieste. Riprova tra un minuto." }
  }

  const { email, confirmEmail, password, confirmPassword, companyName, vatNumber, sdiCode, legalForm, businessType, city, province, address, postalCode, phone } = formData

  if (!email.trim() || !validateEmail(email)) {
    return { success: false, error: "Email non valida." }
  }

  if (email !== confirmEmail) {
    return { success: false, error: "Le email non coincidono." }
  }

  if (password.length < 8) {
    return { success: false, error: "La password deve essere di almeno 8 caratteri." }
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Le password non coincidono." }
  }

  if (!companyName.trim()) {
    return { success: false, error: "Inserisci la ragione sociale." }
  }

  if (!vatNumber.trim()) {
    return { success: false, error: "Inserisci la Partita IVA." }
  }

  const vatError = validateItalianVat(vatNumber)
  if (vatError) {
    return { success: false, error: vatError }
  }

  if (!sdiCode.trim()) {
    return { success: false, error: "Inserisci il codice destinatario fattura." }
  }

  if (!city.trim() || !address.trim() || !postalCode.trim() || !phone.trim()) {
    return { success: false, error: "Compila tutti i campi obbligatori." }
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return { success: false, error: "Email già registrata." }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: companyName.trim(),
      password: hashedPassword,
      role: "user",
      status: "PENDING",
      companyName: companyName.trim(),
      vatNumber: vatNumber.trim(),
      taxCode: formData.taxCode.trim() || null,
      sdiCode: sdiCode.trim(),
      legalForm: legalForm || null,
      businessType: businessType || null,
      phone: phone.trim(),
      city: city.trim(),
      province: province.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      notes: formData.notes.trim() || null,
    },
  })

  const legalFormLabel = LEGAL_FORMS[legalForm] || legalForm
  const businessTypeLabel = BUSINESS_TYPES[businessType] || businessType

  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: "Nuova richiesta di registrazione",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background-color:#772123;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Nuova richiesta di registrazione</h1>
          </div>
          <div style="padding:24px;color:#27272a;">
            <p style="font-size:14px;">Una nuova azienda ha richiesto la registrazione al portale:</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;">
              <tr><td style="padding:6px 8px;font-weight:600;border-bottom:1px solid #e4e4e7;">Ragione Sociale</td><td style="padding:6px 8px;border-bottom:1px solid #e4e4e7;">${companyName}</td></tr>
              <tr><td style="padding:6px 8px;font-weight:600;border-bottom:1px solid #e4e4e7;">P.IVA</td><td style="padding:6px 8px;border-bottom:1px solid #e4e4e7;">${vatNumber}</td></tr>
              <tr><td style="padding:6px 8px;font-weight:600;border-bottom:1px solid #e4e4e7;">Email</td><td style="padding:6px 8px;border-bottom:1px solid #e4e4e7;">${email}</td></tr>
              <tr><td style="padding:6px 8px;font-weight:600;border-bottom:1px solid #e4e4e7;">Forma Giuridica</td><td style="padding:6px 8px;border-bottom:1px solid #e4e4e7;">${legalFormLabel}</td></tr>
              <tr><td style="padding:6px 8px;font-weight:600;border-bottom:1px solid #e4e4e7;">Tipo Attività</td><td style="padding:6px 8px;border-bottom:1px solid #e4e4e7;">${businessTypeLabel}</td></tr>
            </table>
            <p style="margin-top:20px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_URL}/admin/users" style="display:inline-block;background-color:#772123;color:#fff;text-decoration:none;padding:12px 24px;border-radius:50px;font-size:14px;font-weight:600;">
                Gestisci richieste
              </a>
            </p>
          </div>
        </div>
      `,
    })
  } catch (e) {
    console.error("[REGISTER] Errore invio notifica admin:", e)
  }

  return { success: true }
}

export async function loginCustomer(formData: {
  email: string
  password: string
}): Promise<{ success: boolean; error?: string }> {
  const ip = await getClientIpFromHeaders()
  const rateCheck = checkRateLimit(`customer-login:${ip}`, 5, 60_000)
  if (!rateCheck.allowed) {
    return { success: false, error: "Troppi tentativi. Riprova tra un minuto." }
  }

  const { email, password } = formData

  if (!email.trim() || !validateEmail(email)) {
    return { success: false, error: "Email non valida." }
  }

  if (!password) {
    return { success: false, error: "Password richiesta." }
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user || !user.password) {
    return { success: false, error: "Credenziali non valide." }
  }

  if (user.role !== "user") {
    return { success: false, error: "Credenziali non valide." }
  }

  if (user.status === "REJECTED") {
    return { success: false, error: "La tua richiesta non è stata approvata. Contatta l'amministratore." }
  }

  if (user.status === "PENDING") {
    return { success: false, error: "La tua richiesta è in attesa di approvazione. Riceverai una email non appena sarà attivata." }
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60)
    return { success: false, error: `Account temporaneamente bloccato. Riprova tra ${remaining} minuti.` }
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1
    const update: Record<string, unknown> = { failedLoginAttempts: attempts }
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      update.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS)
    }
    await prisma.user.update({ where: { id: user.id }, data: update })
    return { success: false, error: "Credenziali non valide." }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  })

  const existingOrders = await prisma.order.findMany({
    where: { guestEmail: user.email, userId: null },
  })

  if (existingOrders.length > 0) {
    await prisma.order.updateMany({
      where: { guestEmail: user.email, userId: null },
      data: { userId: user.id },
    })
  }

  await createCustomerSession(user)

  return { success: true }
}

export async function logoutCustomer() {
  await destroyCustomerSession()
}
