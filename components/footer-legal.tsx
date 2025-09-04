// components/footer-legal.tsx
import Link from "next/link"

export default function FooterLegal() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-400 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* Bloque legal */}
        <div className="flex flex-wrap items-center gap-2">
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

        {/* Bloque contacto */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-zinc-400">
          <span><a href="tel:+34644978857" className="hover:text-white">644 978 857</a></span>
          <span>·</span>
          <span>
            {" "}
            <a href="mailto:ce.joventut.tt@gmail.com" className="hover:text-white">
              ce.joventut.tt@gmail.com
            </a>
          </span>
          <span>·</span>
          <span>Sant Josep de sa Talaia, Illes Balears</span>
        </div>
      </div>
    </footer>
  )
}
