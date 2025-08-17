// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { TranslationProvider, type Language } from "@/lib/i18n"
import { Toaster } from "@/components/ui/toaster" // ⬅️ IMPORT CORRECTO

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
  icons: {
    icon: [
      { url: "/favicon.ico" }, // fallback
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
