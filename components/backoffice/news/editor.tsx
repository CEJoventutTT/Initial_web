'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { saveNews, type NewsSaveState } from '@/app/admin/news/actions'
import {
  newsCategories,
  newsStatuses,
  type EditorialArticle,
} from '@/lib/news/editorial'
import { clubDateTimeInput } from '@/lib/backoffice/time'

export default function NewsEditor({
  article,
  back,
}: {
  article?: EditorialArticle
  back: string
}) {
  const router = useRouter(),
    form = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<NewsSaveState | null>(null)
  const [kind, setKind] = useState(article?.kind || 'external')
  const [status, setStatus] = useState<keyof typeof newsStatuses>(
    article?.status || 'draft',
  )
  const [image, setImage] = useState(article?.image || '')
  const [dirty, setDirty] = useState(false),
    [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [confirm, setConfirm] = useState<'draft' | 'archived' | null>(null)
  const [identity, setIdentity] = useState({
    id: article?.admin_id || '',
    version: article?.version || 0,
    slug: article?.slug || '',
  })
  const [date] = useState(() => clubDateTimeInput(article?.date || new Date()))
  useEffect(() => {
    if (!dirty) return
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const navigate = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest('a')
      if (
        link &&
        link.target !== '_blank' &&
        !window.confirm('Hay cambios sin guardar. ¿Salir del editor?')
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', unload)
    document.addEventListener('click', navigate, true)
    return () => {
      window.removeEventListener('beforeunload', unload)
      document.removeEventListener('click', navigate, true)
    }
  }, [dirty])
  const save = (nextStatus: keyof typeof newsStatuses) => {
    if (!form.current?.reportValidity()) return
    const data = new FormData(form.current)
    data.set('status', nextStatus)
    data.set('admin_id', identity.id)
    data.set('version', String(identity.version))
    startTransition(async () => {
      const saved = await saveNews(data)
      setResult(saved)
      if (saved.ok) {
        setDirty(false)
        setStatus(nextStatus)
        setIdentity({
          id: saved.adminId!,
          version: saved.version!,
          slug: saved.slug!,
        })
        if (!identity.id)
          router.replace(
            `/admin/news/${saved.adminId}?back=${encodeURIComponent(back)}`,
          )
        else router.refresh()
      }
    })
  }
  const error = (name: string) =>
    result?.errors?.[name] ? (
      <p id={`${name}-error`} className="mt-1 text-sm text-red-300">
        {result.errors[name]}
      </p>
    ) : null
  const inputProps = (name: string) => ({
    id: name,
    name,
    className: 'bo-input',
    'aria-invalid': Boolean(result?.errors?.[name]),
    'aria-describedby': result?.errors?.[name] ? `${name}-error` : undefined,
  })
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link className="bo-link" href={back}>
          ← Volver a noticias
        </Link>
        <p className="text-sm">
          {newsStatuses[status]}
          {dirty ? ' · Cambios sin guardar' : ''}
        </p>
      </div>
      <form
        ref={form}
        onChange={() => setDirty(true)}
        onSubmit={(event) => {
          event.preventDefault()
          save(status)
        }}
        className="bo-panel space-y-6"
      >
        <fieldset
          disabled={pending || uploading}
          className="space-y-6 disabled:opacity-70"
        >
          {status === 'published' && (
            <p className="rounded-lg border border-primary/30 p-4 text-sm">
              Al guardar, los cambios se aplicarán a la noticia pública.
            </p>
          )}
          <div>
            <label htmlFor="title">Título</label>
            <Input
              {...inputProps('title')}
              required
              maxLength={250}
              defaultValue={article?.title}
            />
            {error('title')}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="kind">Tipo de noticia</label>
              <select
                {...inputProps('kind')}
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="external">Enlace a una noticia externa</option>
                <option value="internal">Artículo propio</option>
              </select>
              {error('kind')}
            </div>
            <div>
              <label htmlFor="lang">Idioma</label>
              <select
                {...inputProps('lang')}
                defaultValue={article?.lang || 'ca'}
              >
                <option value="ca">Català</option>
                <option value="es">Castellano</option>
                <option value="en">English</option>
              </select>
              {error('lang')}
            </div>
          </div>
          <div>
            <label htmlFor="excerpt">Resumen</label>
            <Textarea
              {...inputProps('excerpt')}
              maxLength={1000}
              rows={3}
              defaultValue={article?.excerpt}
            />
            {error('excerpt')}
          </div>
          <div hidden={kind !== 'external'}>
            <label htmlFor="external_url">Enlace original</label>
            <Input
              {...inputProps('external_url')}
              disabled={kind !== 'external'}
              type="url"
              maxLength={2000}
              defaultValue={article?.external_url || ''}
              placeholder="https://…"
            />
            {error('external_url')}
          </div>
          <div hidden={kind !== 'internal'}>
            <label htmlFor="body">Contenido</label>
            <Textarea
              {...inputProps('body')}
              disabled={kind !== 'internal'}
              maxLength={100000}
              rows={16}
              defaultValue={article?.body}
            />
            <p className="mt-2 text-sm text-white/65">
              Formato: ## subtítulo, **negrita**, - lista y [texto](https://…).
              Separa párrafos con una línea vacía. El HTML se muestra como
              texto.
            </p>
            {error('body')}
          </div>
          <fieldset>
            <legend className="mb-3">Categorías</legend>
            <div className="flex flex-wrap gap-5">
              {Object.entries(newsCategories).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    name="categories"
                    value={value}
                    defaultChecked={(article?.categories || ['news']).includes(
                      value as keyof typeof newsCategories,
                    )}
                    onCheckedChange={() => setDirty(true)}
                  />
                  {label}
                </label>
              ))}
            </div>
            {error('categories')}
          </fieldset>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="date">Fecha editorial (Madrid)</label>
              <Input
                {...inputProps('date')}
                type="datetime-local"
                defaultValue={date}
                required
              />
              <p className="mt-1 text-sm text-white/65">
                La publicación es inmediata; esta fecha no la programa.
              </p>
              {error('date')}
            </div>
            <div>
              <label htmlFor="read_time">Tiempo de lectura</label>
              <Input
                {...inputProps('read_time')}
                maxLength={50}
                defaultValue={article?.read_time}
                placeholder="Se calcula si lo dejas vacío"
              />
              {error('read_time')}
            </div>
          </div>
          <div className="space-y-4 border-t border-white/15 pt-6">
            <div>
              <label htmlFor="image">URL de portada</label>
              <Input
                {...inputProps('image')}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                maxLength={2000}
                placeholder="Sin portada: imagen de sustitución"
              />
              {error('image')}
            </div>
            <div>
              <label htmlFor="image_file">
                Subir portada (JPEG, PNG o WebP; máximo 4 MB)
              </label>
              <Input
                id="image_file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="bo-input"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  event.target.value = ''
                  setUploading(true)
                  setUploadError('')
                  try {
                    if (file.size > 4194304)
                      throw new Error('La imagen supera 4 MB.')
                    const data = new FormData()
                    data.set('image', file)
                    const response = await fetch(
                      '/api/backoffice/news/images',
                      { method: 'POST', body: data },
                    )
                    const result = await response.json()
                    if (!response.ok) throw new Error(result.error)
                    setImage(result.url)
                    setDirty(true)
                  } catch (error) {
                    setUploadError(
                      (error as Error).message || 'No se pudo subir la imagen.',
                    )
                  } finally {
                    setUploading(false)
                  }
                }}
              />
              <p className="mt-2 text-sm text-white/65">
                La portada subida permanece privada hasta publicar la noticia.
                Guarda para asociarla al artículo.
              </p>
            </div>
            <div>
              <label htmlFor="image_alt">Descripción de la imagen</label>
              <Input
                {...inputProps('image_alt')}
                maxLength={300}
                defaultValue={article?.image_alt}
              />
              {error('image_alt')}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-white/15 pt-6">
            <Button className="bo-button" type="submit">
              {pending
                ? 'Guardando…'
                : status === 'published'
                  ? 'Guardar cambios publicados'
                  : status === 'archived'
                    ? 'Guardar cambios archivados'
                    : 'Guardar borrador'}
            </Button>
            {status === 'draft' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => save('published')}
              >
                Publicar
              </Button>
            )}
            {status === 'published' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirm('draft')}
              >
                Retirar a borrador
              </Button>
            )}
            {status === 'archived' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => save('draft')}
              >
                Restaurar a borrador
              </Button>
            )}
            {identity.id && status !== 'archived' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirm('archived')}
              >
                Archivar
              </Button>
            )}
            {identity.id && (
              <Button asChild variant="outline">
                <Link
                  target="_blank"
                  href={`/admin/news/${identity.id}/preview`}
                >
                  Vista previa guardada ↗
                </Link>
              </Button>
            )}
          </div>
          {!identity.id && (
            <p className="text-sm text-white/65">
              Guarda el borrador para abrir su vista previa.
            </p>
          )}
          {identity.slug && (
            <p className="break-all text-sm text-white/65">
              Enlace permanente: /news/{identity.slug}
            </p>
          )}
        </fieldset>
        {uploading && <p role="status">Subiendo portada…</p>}
        {uploadError && (
          <p role="alert" className="text-red-300">
            {uploadError}
          </p>
        )}
        {result && (
          <div
            role={result.ok ? 'status' : 'alert'}
            className={`rounded-lg border p-4 ${result.ok ? 'border-primary/40' : 'border-red-300/40 text-red-200'}`}
          >
            <p>{result.message}</p>
            {!result.ok && identity.id && (
              <Link
                className="bo-link mt-2 inline-block"
                target="_blank"
                href={`/admin/news/${identity.id}`}
              >
                Abrir versión actual en otra pestaña
              </Link>
            )}
          </div>
        )}
      </form>
      <AlertDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === 'archived' ? 'Archivar noticia' : 'Retirar noticia'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              La noticia dejará de estar disponible en la web pública. Se
              conservarán su contenido e historial. Los cambios del formulario
              también se guardarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm) save(confirm)
                setConfirm(null)
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
