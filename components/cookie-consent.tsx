// components/cookie-consent.tsx
"use client"

import { useEffect, useState } from "react"

export default function CookieConsent() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_consent_v1")
    if (!accepted) setOpen(true)

    // permite reabrir desde la Política de Cookies
    const reopen = () => setOpen(true)
    document.addEventListener("open-cookie-banner", reopen)
    return () => document.removeEventListener("open-cookie-banner", reopen)
  }, [])

  if (!open) return null

  return (
    <div className="fixed bottom-4 inset-x-0 mx-auto max-w-3xl rounded-xl bg-zinc-900/90 backdrop-blur border border-white/10 p-4 text-sm text-zinc-200 shadow-lg z-50">
      <p className="mb-3">
        Usamos cookies propias y de terceros para analizar el uso y mejorar tu experiencia. 
        Consulta la <a href="/politica-cookies" className="underline">Política de Cookies</a>.
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            localStorage.setItem("cookie_consent_v1", "rejected")
            setOpen(false)
          }}
          className="px-3 py-1 rounded-md border border-white/10 hover:bg-white/5"
        >
          Rechazar
        </button>
        <button
          onClick={() => {
            localStorage.setItem("cookie_consent_v1", "accepted")
            setOpen(false)
          }}
          className="px-3 py-1 rounded-md bg-white text-black"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
