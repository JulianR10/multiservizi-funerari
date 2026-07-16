"use client"

import { useState, useCallback } from "react"
import Image from "next/image"

type ImageGalleryProps = {
  images: string[]
  productName: string
}

const FALLBACK_IMAGE = "/placeholder.svg"

function ImageWithFallback({
  src,
  alt,
  ...props
}: {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
}) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(FALLBACK_IMAGE)}
    />
  )
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelected((prev) => (prev > 0 ? prev - 1 : images.length - 1))
      } else if (e.key === "ArrowRight") {
        setSelected((prev) => (prev < images.length - 1 ? prev + 1 : 0))
      }
    },
    [images.length],
  )

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-chalk">
        <img
          src={FALLBACK_IMAGE}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
        <ImageWithFallback
          src={images[selected]}
          alt={`${productName} - Immagine ${selected + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={selected === 0}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setSelected((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Immagine precedente"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden={true}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setSelected((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Immagine successiva"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden={true}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Galleria immagini"
          onKeyDown={handleKeyDown}
        >
          {images.map((src, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === selected}
              aria-label={`Immagine ${i + 1}`}
              onClick={() => setSelected(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${
                i === selected
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <ImageWithFallback src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
