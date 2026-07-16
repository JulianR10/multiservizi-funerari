import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import { writeAuditLog } from "@/lib/audit"
import { deleteProductImage, isStorageConfigured } from "@/lib/storage"

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Storage non configurato" },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 })
  }

  const url = (body as Record<string, unknown>)?.url
  if (typeof url !== "string" || url.length === 0 || url.length > 500) {
    return NextResponse.json({ error: "URL non valido" }, { status: 400 })
  }

  await deleteProductImage(url)
  await writeAuditLog({
    actorId: session.userId,
    actorEmail: session.email,
    action: "product.update",
    entity: "Product",
    entityId: "delete-image",
    metadata: { url },
  })

  return NextResponse.json({ success: true })
}
