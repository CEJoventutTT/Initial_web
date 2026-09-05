'use client'
import { useEffect, useId, useState } from 'react'

type Option = { id: string; label: string }
export default function EntitySelect({
  name,
  label,
  kind,
  initial,
  required = true,
}: {
  name: string
  label: string
  kind: 'students' | 'coaches' | 'people' | 'programs'
  initial?: Option
  required?: boolean
}) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<Option[]>([])
  const [selected, setSelected] = useState(initial?.id ?? '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(false)
      try {
        const response = await fetch(
          `/api/backoffice/options?kind=${kind}&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('load')
        const data: Option[] = await response.json()
        setOptions(data)
      } catch {
        if (!controller.signal.aborted) setError(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [kind, query, retry])
  const allOptions =
    initial && !options.some((option) => option.id === initial.id)
      ? [initial, ...options]
      : options
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        Buscar {label.toLowerCase()}
      </label>
      <input
        id={id}
        className="bo-input"
        value={query}
        maxLength={120}
        onChange={(event) => {
          setQuery(event.target.value)
          setSelected('')
          setLoading(true)
        }}
        placeholder="Escribe para buscar…"
      />
      <label htmlFor={`${id}-select`} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={`${id}-select`}
        name={name}
        className="bo-input"
        required={required}
        value={selected}
        aria-busy={loading}
        onChange={(event) => setSelected(event.target.value)}
      >
        <option value="">
          {loading ? 'Buscando…' : 'Selecciona una opción'}
        </option>
        {allOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="text-sm text-red-200">
          No se pudo cargar.{' '}
          <button
            type="button"
            className="bo-link"
            onClick={() => setRetry((value) => value + 1)}
          >
            Reintentar
          </button>
        </p>
      ) : (
        <p className="text-xs text-white/55" role="status">
          {loading
            ? 'Buscando opciones…'
            : options.length === 0
              ? 'Sin resultados.'
              : 'Hasta 25 coincidencias. Escribe para afinar la búsqueda.'}
        </p>
      )}
    </div>
  )
}
