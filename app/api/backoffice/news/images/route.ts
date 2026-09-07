import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { authenticatedSupabase, hasRole } from '@/lib/supabase/request-auth'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  const { supabase, user } = await authenticatedSupabase(request)
  if (!user || !(await hasRole(supabase, user.id, ['admin'])))
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  // Cookie requests must originate from this site. Bearer clients use explicit authentication.
  const origin = request.headers.get('origin')
  try {
    if (
      origin &&
      new URL(origin).host !==
        (request.headers.get('host') || new URL(request.url).host)
    )
      return NextResponse.json({ error: 'Origen inválido.' }, { status: 403 })
  } catch {
    return NextResponse.json({ error: 'Origen inválido.' }, { status: 403 })
  }
  if (Number(request.headers.get('content-length')) > 4_250_000)
    return NextResponse.json({ error: 'Máximo 4 MB.' }, { status: 413 })
  try {
    const reader = request.body?.getReader()
    if (!reader)
      return NextResponse.json(
        { error: 'Selecciona una imagen.' },
        { status: 400 },
      )
    const chunks: Uint8Array[] = []
    let bytes = 0
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > 4_250_000) {
          await reader.cancel()
          return NextResponse.json({ error: 'Máximo 4 MB.' }, { status: 413 })
        }
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }
    const multipart = new Response(Buffer.concat(chunks), {
      headers: { 'Content-Type': request.headers.get('content-type') || '' },
    })
    const file = (await multipart.formData()).get('image')
    if (!(file instanceof File) || !file.size || file.size > 4_194_304)
      return NextResponse.json(
        { error: 'Selecciona una imagen de hasta 4 MB.' },
        { status: 400 },
      )
    const input = Buffer.from(await file.arrayBuffer())
    const metadata = await sharp(input, {
      limitInputPixels: 40_000_000,
    }).metadata()
    if (!['jpeg', 'png', 'webp'].includes(metadata.format || ''))
      return NextResponse.json(
        { error: 'Usa JPEG, PNG o WebP.' },
        { status: 400 },
      )
    const image = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer()
    const name = `${crypto.randomUUID()}.webp`
    const { error } = await supabase.storage
      .from('news-images')
      .upload(name, image, {
        contentType: 'image/webp',
        cacheControl: '0',
        upsert: false,
      })
    if (error) throw error
    return NextResponse.json({ url: `/api/news/images/${name}` })
  } catch {
    return NextResponse.json(
      {
        error:
          'No se pudo subir la imagen. Comprueba el archivo e inténtalo de nuevo.',
      },
      { status: 400 },
    )
  }
}
