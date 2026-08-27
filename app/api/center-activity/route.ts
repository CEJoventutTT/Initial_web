import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'

const resend = new Resend(process.env.RESEND_API_KEY)
const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5
const MAX_BODY_BYTES = 20_000

const Schema = z.object({
  fullName: z.string().trim().min(1).max(120),
  birthDate: z.string().date(),
  municipality: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(3).max(30),
  email: z.string().trim().email().max(254),
  referralSource: z.string().trim().min(1).max(120),
  competitionInterest: z.enum(['yes', 'no', 'later']),
  eventInterest: z.enum(['yes', 'no']),
  dataProtectionConsent: z.literal(true),
})

type Application = z.infer<typeof Schema>

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character)
}

const interestLabel = (value: Application['competitionInterest'] | Application['eventInterest']) =>
  ({ yes: 'Sí', no: 'No', later: 'Más adelante' })[value]

function htmlAdmin(data: Application) {
  const safe = {
    fullName: escapeHtml(data.fullName),
    birthDate: escapeHtml(data.birthDate),
    municipality: escapeHtml(data.municipality),
    phone: escapeHtml(data.phone),
    email: escapeHtml(data.email),
    referralSource: escapeHtml(data.referralSource),
  }
  return `
  <div style="font-family:system-ui,Arial">
    <h2>Nueva inscripción al club</h2>
    <p><b>Nombre y apellidos:</b> ${safe.fullName}</p>
    <p><b>Fecha de nacimiento:</b> ${safe.birthDate}</p>
    <p><b>Municipio de residencia:</b> ${safe.municipality}</p>
    <p><b>Teléfono:</b> ${safe.phone}</p>
    <p><b>Correo electrónico:</b> ${safe.email}</p>
    <p><b>¿Cómo nos ha conocido?:</b> ${safe.referralSource}</p>
    <hr/>
    <p><b>Interés en competiciones:</b> ${escapeHtml(interestLabel(data.competitionInterest))}</p>
    <p><b>Interés en campus, torneos y eventos:</b> ${escapeHtml(interestLabel(data.eventInterest))}</p>
    <hr/>
    <p><b>Protección de datos:</b> Consentimiento aceptado</p>
  </div>`
}

function htmlUser(data: Application) {
  return `
  <div style="font-family:system-ui,Arial">
    <p>Hola ${escapeHtml(data.fullName)},</p>
    <p>Hemos recibido tus datos para formar parte del Club Esportiu Joventut TT.</p>
    <p>Nos pondremos en contacto contigo para empezar los entrenamientos.</p>
    <p>Saludos,<br/>CE Joventut TT</p>
  </div>`
}

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

async function isRateLimited(request: Request) {
  // Vercel provides this header from the connecting client. The fallback keeps
  // local deployments behind a conventional proxy working as well.
  const ip = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
  const clientKey = createHash('sha256').update(ip).digest('hex')
  const { url, serviceRoleKey } = requireSupabaseAdminConfig()
  const supabase = createClient(url, serviceRoleKey)
  const { data, error } = await supabase.rpc('consume_join_rate_limit', {
    p_client_key: clientKey,
    p_max_requests: MAX_REQUESTS_PER_WINDOW,
    p_window_seconds: WINDOW_MS / 1000,
  })

  if (error || typeof data !== 'boolean') {
    console.error('[center-activity] rate limit error:', error)
    throw new Error('Rate limit unavailable')
  }

  return !data
}

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Request too large' }, { status: 413 })
  }
  try {
    if (await isRateLimited(request)) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
    }

    let body: unknown
    try {
      body = await readJsonWithLimit(request)
    } catch (error) {
      if (error instanceof RangeError) {
        return NextResponse.json({ ok: false, error: 'Request too large' }, { status: 413 })
      }
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
    }
    const data = Schema.parse(body)
    const validateOnly = new URL(request.url).searchParams.get('validateOnly') === 'true'

    if (validateOnly) {
      return NextResponse.json({ ok: true })
    }

    const fromEmail = process.env.BRAND_FROM_EMAIL
    const adminEmail = process.env.REQUESTS_INBOX_EMAIL
    if (!process.env.RESEND_API_KEY || !fromEmail || !adminEmail) {
      throw new Error('Email service is not configured')
    }
    const from = `${process.env.BRAND_FROM_NAME || 'CE Joventut TT'} <${fromEmail}>`

    const admin = await resend.emails.send({
      from,
      to: adminEmail,
      replyTo: `${data.fullName} <${data.email}>`,
      subject: `Nueva inscripción al club — ${data.fullName} (${data.municipality})`,
      html: htmlAdmin(data),
    })

    if (process.env.SEND_USER_CONFIRMATION !== 'false') {
      await resend.emails.send({
        from,
        to: data.email,
        replyTo: adminEmail,
        subject: 'Hemos recibido tu inscripción — CE Joventut TT',
        html: htmlUser(data),
      })
    }

    return NextResponse.json({ ok: true, id: admin.data?.id ?? null })
  } catch (error: unknown) {
    console.error('[center-activity] error:', error)
    const message = error instanceof z.ZodError
      ? 'Invalid request data'
      : 'Unable to process request'
    return NextResponse.json(
      { ok: false, error: message },
      { status: error instanceof z.ZodError ? 400 : 500 },
    )
  }
}
