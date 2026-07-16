"use server"

import { prisma } from "@/lib/prisma"
import { getCustomerSession } from "@/lib/customer-auth"
import { revalidatePath } from "next/cache"

const MAX = 200

function trim(v: unknown, max = MAX): string {
  if (typeof v !== "string") return ""
  return v.trim().slice(0, max)
}

export type AddressResult = {
  success: boolean
  error?: string
  field?: string
}

async function getApprovedUser() {
  const session = await getCustomerSession()
  if (!session) return { error: "Devi effettuare l'accesso." as const }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, status: true, role: true },
  })
  if (!user || user.role !== "user") {
    return { error: "Non autorizzato." as const }
  }
  if (user.status !== "APPROVED") {
    return { error: "Il tuo account non è abilitato." as const }
  }
  return { user }
}

export async function createAddress(formData: {
  label?: string
  firstName: string
  lastName: string
  company?: string
  address: string
  address2?: string
  city: string
  province?: string
  postalCode: string
  country?: string
  phone?: string
  isDefault?: boolean
}): Promise<AddressResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const firstName = trim(formData.firstName)
  const lastName = trim(formData.lastName)
  if (!firstName) return { success: false, field: "firstName", error: "Nome obbligatorio." }
  if (!lastName) return { success: false, field: "lastName", error: "Cognome obbligatorio." }

  const address = trim(formData.address)
  if (!address) return { success: false, field: "address", error: "Indirizzo obbligatorio." }

  const city = trim(formData.city, 80)
  if (!city) return { success: false, field: "city", error: "Città obbligatoria." }

  const postalCode = trim(formData.postalCode, 10)
  if (!postalCode) return { success: false, field: "postalCode", error: "CAP obbligatorio." }
  if (!/^[0-9]{5}$/.test(postalCode)) {
    return { success: false, field: "postalCode", error: "CAP non valido (5 cifre)." }
  }

  const province = trim(formData.province, 4).toUpperCase()
  if (province && !/^[A-Z]{2}$/.test(province)) {
    return { success: false, field: "province", error: "Provincia non valida (es. CZ)." }
  }

  const isDefault = formData.isDefault === true

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: auth.user.id },
      data: { isDefault: false },
    })
  } else {
    const count = await prisma.address.count({ where: { userId: auth.user.id } })
    if (count === 0) {
      formData.isDefault = true
    }
  }

  await prisma.address.create({
    data: {
      userId: auth.user.id,
      label: trim(formData.label, 80) || null,
      firstName,
      lastName,
      company: trim(formData.company, MAX) || null,
      address,
      address2: trim(formData.address2, MAX) || null,
      city,
      province: province || null,
      postalCode,
      country: trim(formData.country, 2).toUpperCase() || "IT",
      phone: trim(formData.phone, 30) || null,
      isDefault: formData.isDefault === true,
    },
  })

  revalidatePath("/account/addresses")
  revalidatePath("/account")
  return { success: true }
}

export async function updateAddress(
  id: string,
  formData: {
    label?: string
    firstName: string
    lastName: string
    company?: string
    address: string
    address2?: string
    city: string
    province?: string
    postalCode: string
    country?: string
    phone?: string
    isDefault?: boolean
  }
): Promise<AddressResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const existing = await prisma.address.findFirst({
    where: { id, userId: auth.user.id },
  })
  if (!existing) {
    return { success: false, error: "Indirizzo non trovato." }
  }

  const firstName = trim(formData.firstName)
  const lastName = trim(formData.lastName)
  if (!firstName) return { success: false, field: "firstName", error: "Nome obbligatorio." }
  if (!lastName) return { success: false, field: "lastName", error: "Cognome obbligatorio." }

  const address = trim(formData.address)
  if (!address) return { success: false, field: "address", error: "Indirizzo obbligatorio." }

  const city = trim(formData.city, 80)
  const postalCode = trim(formData.postalCode, 10)
  if (!city) return { success: false, field: "city", error: "Città obbligatoria." }
  if (!postalCode || !/^[0-9]{5}$/.test(postalCode)) {
    return { success: false, field: "postalCode", error: "CAP non valido (5 cifre)." }
  }

  const province = trim(formData.province, 4).toUpperCase()
  if (province && !/^[A-Z]{2}$/.test(province)) {
    return { success: false, field: "province", error: "Provincia non valida (es. CZ)." }
  }

  if (formData.isDefault === true) {
    await prisma.address.updateMany({
      where: { userId: auth.user.id, NOT: { id } },
      data: { isDefault: false },
    })
  }

  await prisma.address.update({
    where: { id },
    data: {
      label: trim(formData.label, 80) || null,
      firstName,
      lastName,
      company: trim(formData.company, MAX) || null,
      address,
      address2: trim(formData.address2, MAX) || null,
      city,
      province: province || null,
      postalCode,
      country: trim(formData.country, 2).toUpperCase() || "IT",
      phone: trim(formData.phone, 30) || null,
      isDefault: formData.isDefault === true,
    },
  })

  revalidatePath("/account/addresses")
  revalidatePath("/account")
  return { success: true }
}

export async function deleteAddress(id: string): Promise<AddressResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const existing = await prisma.address.findFirst({
    where: { id, userId: auth.user.id },
  })
  if (!existing) {
    return { success: false, error: "Indirizzo non trovato." }
  }

  await prisma.address.delete({ where: { id } })

  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "asc" },
    })
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      })
    }
  }

  revalidatePath("/account/addresses")
  revalidatePath("/account")
  return { success: true }
}

export async function setDefaultAddress(id: string): Promise<AddressResult> {
  const auth = await getApprovedUser()
  if ("error" in auth) return { success: false, error: auth.error }

  const existing = await prisma.address.findFirst({
    where: { id, userId: auth.user.id },
  })
  if (!existing) {
    return { success: false, error: "Indirizzo non trovato." }
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: auth.user.id, NOT: { id } },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id },
      data: { isDefault: true },
    }),
  ])

  revalidatePath("/account/addresses")
  revalidatePath("/account")
  return { success: true }
}
