import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { ZodError } from 'zod'
import { acknowledgementParams, applicationSchema, joinTemplateParams } from '@/lib/email/contracts'
import { submitEmail } from '@/lib/email/submit'
import { consumeRateLimit } from '@/lib/rate-limit'

const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5
const MAX_BODY_BYTES = 20_000
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/

async function readJsonWithLimit(request: Request) {
  if (!request.body) throw new SyntaxError('Missing request body')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel()
      throw new RangeError('Request too large')
    }
    chunks.push(value)
  }
  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(body)) as unknown
}

async function isRateLimited(request: Request, requestId: string) {
  const ip = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
  const clientKey = createHash('sha256').update(ip).digest('hex')
  const result = await consumeRateLimit(
    `rate-limit:center-activity:${clientKey}`,
    MAX_REQUESTS_PER_WINDOW,
    WINDOW_MS / 1000, requestId,
  )
  return result.limited
}

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Request too large' }, { status: 413 })
  }

  try {
    const requestId = request.headers.get('idempotency-key') || ''
    if (!REQUEST_ID_PATTERN.test(requestId)) {
      return NextResponse.json({ ok: false, error: 'Missing or invalid Idempotency-Key' }, { status: 400 })
    }
    if (await isRateLimited(request, requestId)) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
    }
    const body = await readJsonWithLimit(request)
    const application = applicationSchema.parse(body)
    const notice = joinTemplateParams(application)
    const result = await submitEmail('join', notice, acknowledgementParams('join', notice), requestId)
    return NextResponse.json(
      { ok: true, id: result.id, provider: result.provider, duplicate: result.duplicate, pending: result.pending },
      { status: result.pending ? 202 : 200 },
    )
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ ok: false, error: 'Request too large' }, { status: 413 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 })
    }
    console.error('[center-activity] delivery failed', error)
    return NextResponse.json({ ok: false, error: 'Unable to process request' }, { status: 500 })
  }
}
