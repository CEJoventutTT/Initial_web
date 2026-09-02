import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { ZodError } from 'zod'
import { acknowledgementParams, contactSchema, contactTemplateParams } from '@/lib/email/contracts'
import { submitEmail } from '@/lib/email/submit'
import { consumeRateLimit } from '@/lib/rate-limit'

const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5
const MAX_BODY_BYTES = 12_000
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/

async function getBody(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) throw new RangeError('Request too large')
  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new RangeError('Request too large')
  return JSON.parse(text) as unknown
}

async function isRateLimited(request: Request, requestId: string) {
  const ip = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
  const clientKey = createHash('sha256').update(ip).digest('hex')
  const result = await consumeRateLimit(`rate-limit:contact:${clientKey}`, MAX_REQUESTS_PER_WINDOW, WINDOW_MS / 1000, requestId)
  return result.limited
}

export async function POST(request: Request) {
  try {
    const requestId = request.headers.get('idempotency-key') || ''
    if (!REQUEST_ID_PATTERN.test(requestId)) {
      return NextResponse.json({ ok: false, error: 'Missing or invalid Idempotency-Key' }, { status: 400 })
    }
    if (await isRateLimited(request, requestId)) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
    }
    const contact = contactSchema.parse(await getBody(request))
    const notice = contactTemplateParams(contact)
    const result = await submitEmail('contact', notice, acknowledgementParams('contact', notice), requestId)
    return NextResponse.json(
      { ok: true, id: result.id, provider: result.provider, duplicate: result.duplicate, pending: result.pending },
      { status: result.pending ? 202 : 200 },
    )
  } catch (error) {
    if (error instanceof RangeError) return NextResponse.json({ ok: false, error: 'Request too large' }, { status: 413 })
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 })
    }
    console.error('[contact] delivery failed', error)
    return NextResponse.json({ ok: false, error: 'Unable to process request' }, { status: 500 })
  }
}
