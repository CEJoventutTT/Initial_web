import Link from 'next/link'
import type { ReactNode } from 'react'
import { listUrl, PAGE_SIZE, type SearchParams } from '@/lib/backoffice/list'

export function PageHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-white/65">{description}</p>
    </header>
  )
}
export function Field({
  label,
  name,
  children,
}: {
  label: string
  name: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
export function Pagination({
  path,
  params,
  page,
  count,
  pageKey = 'page',
}: {
  path: string
  params: SearchParams
  page: number
  count: number
  pageKey?: string
}) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  return (
    <nav
      aria-label="Paginación"
      className="mt-5 flex flex-wrap items-center gap-4 text-sm"
    >
      <span>
        {count} registros · Página {page} de {pages}
      </span>
      {page > 1 && (
        <Link
          className="bo-link"
          href={listUrl(path, params, { [pageKey]: String(page - 1) })}
        >
          Anterior
        </Link>
      )}
      {page < pages && (
        <Link
          className="bo-link"
          href={listUrl(path, params, { [pageKey]: String(page + 1) })}
        >
          Siguiente
        </Link>
      )}
    </nav>
  )
}
export function Filters({
  path,
  q,
  children,
}: {
  path: string
  q: string
  children?: ReactNode
}) {
  return (
    <form
      action={path}
      className="bo-panel mb-6 flex flex-wrap items-end gap-4"
    >
      <Field label="Buscar" name="q">
        <input
          id="q"
          name="q"
          defaultValue={q}
          maxLength={120}
          className="bo-input"
          placeholder="Nombre o correo"
        />
      </Field>
      {children}
      <button className="bo-button">Filtrar</button>
      <Link className="bo-link text-sm" href={path}>
        Limpiar filtros
      </Link>
    </form>
  )
}
export function Empty({
  children = 'No hay resultados para estos filtros.',
}: {
  children?: ReactNode
}) {
  return (
    <p className="rounded-lg border border-dashed border-white/20 p-6 text-white/65">
      {children}
    </p>
  )
}
