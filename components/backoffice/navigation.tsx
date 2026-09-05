'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BackofficeNavigation({ admin }: { admin: boolean }) {
  const pathname = usePathname()
  const links = [
    ...(admin
      ? [
          ['/admin', 'Inicio'],
          ['/admin/applications', 'Solicitudes'],
          ['/admin/people', 'Personas'],
          ['/admin/programs', 'Programas'],
          ['/admin/emails', 'Correos'],
        ]
      : []),
    ['/coach/sessions', 'Sesiones'],
    ['/coach/attendance', 'Asistencia'],
  ]
  return (
    <nav
      aria-label="Backoffice"
      className="mb-8 flex flex-wrap gap-2 border-b border-white/15 pb-5"
    >
      {links.map(([href, label]) => {
        const active =
          href === '/admin' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-lg px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? 'bg-[#b1e346] font-semibold text-[#13200a]' : 'bg-white/5 text-white/75 hover:bg-white/10'}`}
          >
            {label}
          </Link>
        )
      })}
      <Link
        className="ml-auto rounded-lg px-4 py-2 text-sm text-white/65 underline"
        href="/dashboard"
      >
        Mi área
      </Link>
    </nav>
  )
}
