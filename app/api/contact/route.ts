import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { ZodError } from 'zod'
import { acknowledgementParams, contactSchema, contactTemplateParams } from '@/lib/email/contracts'
import { submitEmail } from '@/lib/email/submit'
import { consumeRateLimit } from '@/lib/rate-limit'

const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5
const MAX_BODY_BYTES = 12_000

async function getBody(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) throw new RangeError('Request too large')
  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new RangeError('Request too large')
  return JSON.parse(text) as unknown
}

async function isRateLimited(request: Request) {
  const ip = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
  const clientKey = createHash('sha256').update(ip).digest('hex')
  const result = await consumeRateLimit(`rate-limit:contact:${clientKey}`, MAX_REQUESTS_PER_WINDOW, WINDOW_MS / 1000)
  return result.limited
}

export async function POST(request: Request) {
  try {
    if (await isRateLimited(request)) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
    }
    const contact = contactSchema.parse(await getBody(request))
    const notice = contactTemplateParams(contact)
    const result = await submitEmail('contact', notice, acknowledgementParams('contact', notice), contact)
    return NextResponse.json({ ok: true, id: result.id, provider: result.provider, duplicate: result.duplicate })
  } catch (error) {
    if (error instanceof RangeError) return NextResponse.json({ ok: false, error: 'Request too large' }, { status: 413 })
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 })
    }
    console.error('[contact] delivery failed', error)
    return NextResponse.json({ ok: false, error: 'Unable to process request' }, { status: 500 })
  }
}
