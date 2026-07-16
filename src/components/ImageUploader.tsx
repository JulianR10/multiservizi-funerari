"use client"

import { useState, useRef, useTransition } from "react"
import Image from "next/image"
import { toast } from "sonner"

type ImageUploaderProps = {
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
}

const MAX_BYTES = 5 * 1024 * 1024

export function ImageUploader({ value, onChange, maxFiles = 8 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [, startTransition] = useTransition()

  async function uploadFiles(files: FileList | File[]) {
    if (!files || files.length === 0) return
    const remaining = maxFiles - value.length
    if (remaining <= 0) {
      toast.error(`Massimo ${maxFiles} immagini`)
      return
    }

    const list = Array.from(files).slice(0, remaining)
    setUploading(true)
    const uploaded: string[] = []
    try {
      for (const file of list) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name}: non è un'immagine`)
          continue
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name}: troppo grande (max 5MB)`)
          continue
        }
        const form = new FormData()
        form.append("file", file)
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err.error || `Errore upload ${file.name}`)
          continue
        }
        const data = (await res.json()) as { url: string }
        uploaded.push(data.url)
      }
      if (uploaded.length > 0) {
        startTransition(() => {
          onChange([...value, ...uploaded])
        })
        toast.success(`${uploaded.length} immagine${uploaded.length === 1 ? "" : "i"} caricata${uploaded.length === 1 ? "" : "e"}`)
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  function removeImage(index: number) {
    const next = value.filter((_, i) => i !== index)
    onChange(next)
  }

  function moveImage(index: number, direction: -1 | 1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= value.length) return
    const next = [...value]
    ;[next[index], next[newIndex]] = [next[newIndex], next[index]]
    onChange(next)
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-zinc-300 bg-zinc-50 hover:border-zinc-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/webp,image/jpeg,image/png,image/avif"
          multiple
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-zinc-600">Caricamento in corso…</p>
          </div>
        ) : (
          <>
            <svg
              className="h-8 w-8 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-zinc-700">
              Trascina le immagini qui o clicca per selezionarle
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              WebP, JPEG, PNG, AVIF · max 5 MB · fino a {maxFiles} immagini
            </p>
          </>
        )}
      </div>

      {value.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-50"
            >
              {url.startsWith("http") || url.startsWith("/uploads/") || url.startsWith("/images/") ? (
                <Image
                  src={url}
                  alt={`Immagine ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                  unoptimized={url.startsWith("http")}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-2 text-xs text-zinc-400">
                  {url}
                </div>
              )}
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                  Principale
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    moveImage(index, -1)
                  }}
                  disabled={index === 0}
                  className="rounded bg-white/90 px-2 py-0.5 text-[11px] font-medium text-zinc-700 hover:bg-white disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    moveImage(index, 1)
                  }}
                  disabled={index === value.length - 1}
                  className="rounded bg-white/90 px-2 py-0.5 text-[11px] font-medium text-zinc-700 hover:bg-white disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                  className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-xs text-zinc-500">
        {value.length} di {maxFiles} immagini. La prima è quella principale del prodotto.
      </p>
    </div>
  )
}
