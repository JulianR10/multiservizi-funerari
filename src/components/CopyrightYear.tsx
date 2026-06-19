"use client"

export function CopyrightYear() {
  return <>&copy; {new Date().getFullYear()}</>
}

export function FormattedDate() {
  return (
    <>
      {new Date().toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </>
  )
}
