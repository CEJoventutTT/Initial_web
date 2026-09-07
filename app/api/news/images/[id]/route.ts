import { authenticatedSupabase } from '@/lib/supabase/request-auth'
export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const headers = {
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  }
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/.test(
      id,
    )
  )
    return new Response(null, { status: 404, headers })
  const { supabase } = await authenticatedSupabase(request)
  const { data, error } = await supabase.storage
    .from('news-images')
    .download(id)
  if (error || !data) return new Response(null, { status: 404, headers })
  return new Response(data, {
    headers: { ...headers, 'Content-Type': 'image/webp' },
  })
}
