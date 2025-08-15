// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { TranslationProvider, type Language } from "@/lib/i18n"
import { Toaster } from "@/components/ui/toaster" // ⬅️ IMPORT CORRECTO (named import)

// Carga SSR de diccionarios
async function loadDict(lang: Language) {
  switch (lang) {
    case "ca":
      return (await import("@/lib/i18n/locales/ca.json")).default
    case "en":
      return (await import("@/lib/i18n/locales/en.json")).default
    default:
      return (await import("@/lib/i18n/locales/es.json")).default
  }
}

export const metadata: Metadata = {
  title: "Club Esportiu Joventut - Sant Josep de sa Talaia, Ibiza, Baleares",
  description: "Club de tenis de mesa inclusivo en Baleares",
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get("lang")?.value ?? "es"
  const lang: Language = (["es", "en", "ca"] as const).includes(rawLang as Language)
    ? (rawLang as Language)
    : "es"

  const dict = await loadDict(lang)

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="font-inter">
        <TranslationProvider initialLanguage={lang} dictionary={dict}>
          {children}
          {/* Toaster global para poder usar useToast() en toda la app */}
          <Toaster />
        </TranslationProvider>
      </body>
    </html>
  )
}
