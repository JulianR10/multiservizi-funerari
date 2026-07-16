import { prisma } from "./prisma"

export type AuditAction =
  | "user.approve"
  | "user.reject"
  | "user.update"
  | "order.update_status"
  | "order.update_tracking"
  | "order.refund"
  | "order.partial_refund"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "product.bulk_publish"
  | "product.bulk_unpublish"
  | "product.bulk_delete"
  | "shipping.create"
  | "shipping.update"
  | "shipping.delete"
  | "shipping.toggle"
  | "settings.update"
  | "auth.login_failed"

export type AuditEntity =
  | "User"
  | "Order"
  | "Product"
  | "ShippingMethod"
  | "Setting"
  | "Auth"

export type AuditInput = {
  actorId?: string | null
  actorEmail?: string | null
  action: AuditAction
  entity: AuditEntity
  entityId: string
  metadata?: Record<string, unknown>
}

const MAX = 2000

function trim(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null
  return v.slice(0, MAX)
}

export async function writeAuditLog(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: trim(input.actorId) || null,
        actorEmail: trim(input.actorEmail)?.toLowerCase() || null,
        action: input.action,
        entity: input.entity,
        entityId: trim(input.entityId) || "",
        ...(input.metadata
          ? { metadata: JSON.parse(JSON.stringify(input.metadata)) as object }
          : {}),
      },
    })
  } catch (err) {
    console.error("[AUDIT] Failed to write log:", err)
  }
}
