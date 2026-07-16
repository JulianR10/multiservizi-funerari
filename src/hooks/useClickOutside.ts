import { useEffect, RefObject } from "react"

export function useClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  handler: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return

    const items = Array.isArray(refs) ? refs : [refs]

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const clicked = items.some((r) => r.current?.contains(e.target as Node))
      if (!clicked) handler()
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
    }
  }, [refs, handler, enabled])
}
