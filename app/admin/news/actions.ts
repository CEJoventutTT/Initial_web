'use server'
import { revalidatePath } from 'next/cache'
import { requireOperator } from '@/lib/backoffice/server'
import { validateNews } from '@/lib/news/editorial'
import { syncNewsFromRss } from '@/lib/news-rss-sync'

export type NewsSaveState = {
  ok: boolean
  message: string
  errors?: Record<string, string>
  adminId?: string
  version?: number
  slug?: string
  status?: string
}
export async function saveNews(data: FormData): Promise<NewsSaveState> {
  try {
    const { supabase } = await requireOperator()
    const { errors, value } = validateNews(data)
    if (Object.keys(errors).length)
      return { ok: false, message: 'Revisa los campos indicados.', errors }
    const id = String(data.get('admin_id') || '')
    const version = Number(data.get('version'))
    if (
      (id &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
          id,
        )) ||
      !Number.isSafeInteger(version)
    )
      return { ok: false, message: 'Identificador o versión inválidos.' }
    const result = await supabase.rpc('admin_save_news', {
      p_admin_id: id || null,
      p_version: version,
      p_data: value,
    })
    if (result.error)
      return {
        ok: false,
        message:
          result.error.code === 'P0001'
            ? result.error.message
            : 'No se pudo guardar la noticia. Revisa los datos e inténtalo de nuevo.',
      }
    const row = result.data
    revalidatePath('/admin/news', 'layout')
    revalidatePath('/news', 'layout')
    revalidatePath('/')
    revalidatePath('/sitemap.xml')
    return {
      ok: true,
      message:
        value.status === 'published'
          ? 'Noticia publicada. Los cambios ya están disponibles.'
          : 'Noticia guardada.',
      adminId: row.admin_id,
      version: row.version,
      slug: row.slug,
      status: row.status,
    }
  } catch {
    return {
      ok: false,
      message: 'No se pudo guardar. Comprueba tu sesión y vuelve a intentarlo.',
    }
  }
}
export async function synchronizeNews(): Promise<{
  ok: boolean
  message: string
}> {
  try {
    const { user } = await requireOperator()
    const result = await syncNewsFromRss(user.id)
    revalidatePath('/admin/news')
    return {
      ok: true,
      message: `Sincronización completada: ${'created' in result ? result.created : 0} borradores nuevos; ${'skipped' in result ? result.skipped : 0} entradas omitidas.`,
    }
  } catch (error) {
    revalidatePath('/admin/news')
    return {
      ok: false,
      message:
        (error as { code?: string }).code === 'P0001'
          ? (error as { message: string }).message
          : 'No se pudo sincronizar. Consulta el resultado y vuelve a intentarlo.',
    }
  }
}
