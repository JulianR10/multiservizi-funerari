import { put, del, list, type PutBlobResult } from "@vercel/blob"

const ALLOWED_TYPES = new Set([
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/avif",
])

const EXT_BY_TYPE: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
}

export const MAX_BYTES = 5 * 1024 * 1024
const FOLDER = "products"

export type UploadResult = {
  url: string
  filename: string
  size: number
  type: string
}

export function isStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function randomName(ext: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 10)
  return `${ts}-${rand}.${ext}`
}

export async function uploadProductImage(file: File): Promise<UploadResult> {
  if (!isStorageConfigured()) {
    throw new Error(
      "Storage non configurato: imposta BLOB_READ_WRITE_TOKEN. Vedi .env.example"
    )
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Formato non supportato. Usa WebP, JPEG, PNG o AVIF.")
  }

  if (file.size > MAX_BYTES) {
    throw new Error("File troppo grande. Massimo 5 MB.")
  }

  const ext = EXT_BY_TYPE[file.type] || "jpg"
  const filename = `${FOLDER}/${randomName(ext)}`

  const blob: PutBlobResult = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  })

  return {
    url: blob.url,
    filename: blob.pathname,
    size: file.size,
    type: file.type,
  }
}

export async function deleteProductImage(url: string): Promise<void> {
  if (!isStorageConfigured()) {
    return
  }
  if (!url || !url.includes("vercel-storage.com") && !url.includes("blob.vercel-storage.com")) {
    return
  }
  try {
    await del(url)
  } catch (err) {
    console.error("[STORAGE] Failed to delete blob:", err)
  }
}

export async function listProductImages(prefix = "products/"): Promise<{ pathname: string; url: string; size: number; uploadedAt: Date }[]> {
  if (!isStorageConfigured()) {
    return []
  }
  const result = await list({ prefix, limit: 1000 })
  return result.blobs.map((b) => ({
    pathname: b.pathname,
    url: b.url,
    size: b.size,
    uploadedAt: b.uploadedAt,
  }))
}
