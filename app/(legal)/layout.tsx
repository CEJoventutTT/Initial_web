// app/(legal)/layout.tsx
import type { Metadata } from "next"
import LegalTopBar from "./legal-topbar"

export const metadata: Metadata = {
  title: "Información legal | Club Esportiu Joventut",
  description: "Aviso legal, privacidad, cookies y términos del Club Esportiu Joventut.",
  robots: { index: true, follow: true }
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-dark text-white">
      {/* Top bar sticky con botón volver + selector de idioma */}
      <LegalTopBar />

      {/* Contenedor central mejorado */}
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <article className="prose prose-invert max-w-none">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
            {children}
          </div>
        </article>
      </div>
    </main>
  )
}
