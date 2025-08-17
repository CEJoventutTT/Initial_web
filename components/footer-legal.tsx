// components/footer-legal.tsx
import Link from "next/link"

export default function FooterLegal() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-400 flex flex-wrap gap-4">
        <Link href="/aviso-legal" className="hover:text-white">
          Aviso Legal
        </Link>
        <span>·</span>
        <Link href="/politica-privacidad" className="hover:text-white">
          Política de Privacidad
        </Link>
        <span>·</span>
        <Link href="/politica-cookies" className="hover:text-white">
          Política de Cookies
        </Link>
        <span>·</span>
        <Link href="/terminos-condiciones" className="hover:text-white">
          Términos y Condiciones
        </Link>
      </div>
    </footer>
  )
}
