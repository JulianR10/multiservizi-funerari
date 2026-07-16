import { createSession, destroySession, getSession } from "./session"

const COOKIE = "customer_session"
const MAX_AGE = 7 * 24 * 60 * 60 // 7d

export type CustomerSession = {
  userId: string
  email: string
  name: string | null
  role: string
  status: string
}

export async function createCustomerSession(user: {
  id: string
  email: string
  name: string | null
  role: string
  status: string
}) {
  return await createSession(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
    COOKIE,
    MAX_AGE
  )
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  return await getSession<CustomerSession>(COOKIE)
}

export async function destroyCustomerSession() {
  await destroySession(COOKIE)
}
