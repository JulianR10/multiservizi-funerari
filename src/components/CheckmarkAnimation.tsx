"use client"

export function CheckmarkAnimation() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
      <svg
        className="h-8 w-8 text-green-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: "checkmark-draw 0.5s ease-out 0.3s forwards",
          strokeDasharray: 30,
          strokeDashoffset: 30,
        }}
      >
        <path d="m4.5 12.75 6 6 9-13.5" />
      </svg>

    </div>
  )
}
