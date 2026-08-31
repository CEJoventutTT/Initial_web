import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { createHash } from 'node:crypto'
import { consumeRateLimit } from '@/lib/rate-limit'

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

type EmailJsConfig = {
  serviceId: string
  contactTemplateId: string
  autoReplyTemplateId: string
  publicKey: string
  privateKey?: string
}

function getEmailJsConfig(): EmailJsConfig | null {
  const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const contactTemplateId = process.env.EMAILJS_CONTACT_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const autoReplyTemplateId = process.env.EMAILJS_AUTO_REPLY_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID2
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId || !contactTemplateId || !autoReplyTemplateId || !publicKey) return null

  return {
    serviceId,
    contactTemplateId,
    autoReplyTemplateId,
    publicKey,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
  }
}

async function sendEmailJs(config: EmailJsConfig, templateId: string, templateParams: Record<string, string>) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: templateId,
      user_id: config.publicKey,
      template_params: templateParams,
      ...(config.privateKey ? { accessToken: config.privateKey } : {}),
    }),
  })

  if (!response.ok) {
    throw new Error(`EmailJS request failed with status ${response.status}`)
  }
}

async function sendEmailJsFallback(
  data: Application,
  { sendAdmin = true, sendUser = true }: { sendAdmin?: boolean; sendUser?: boolean } = {},
) {
  const config = getEmailJsConfig()
  if (!config) throw new Error('No email provider is configured')

  const [firstName, ...lastNameParts] = data.fullName.split(/\s+/)
  const contactParams = {
    firstName,
    lastName: lastNameParts.join(' '),
    email: data.email,
    phone: data.phone,
    subject: `Nueva inscripción — ${data.fullName}`,
    message: [
      `Fecha de nacimiento: ${data.birthDate}`,
      `Municipio: ${data.municipality}`,
      `Cómo nos ha conocido: ${data.referralSource}`,
      `Interés en competiciones: ${interestLabel(data.competitionInterest)}`,
      `Interés en campus, torneos y eventos: ${interestLabel(data.eventInterest)}`,
    ].join('\n'),
  }

  if (sendAdmin) {
    await sendEmailJs(config, config.contactTemplateId, contactParams)
  }

  if (sendUser) {
    // EmailJS accepts one request per second. Keep the fallback reliable when
    // it needs to notify both the club and the applicant.
    if (sendAdmin) await new Promise((resolve) => setTimeout(resolve, 1_100))
    await sendEmailJs(config, config.autoReplyTemplateId, {
      ...contactParams,
      subject: 'Hemos recibido tu inscripción — CE Joventut TT',
      message: 'Hemos recibido tus datos para formar parte del Club Esportiu Joventut TT. Nos pondremos en contacto contigo para empezar los entrenamientos.',
    })
  }
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
  const result = await consumeRateLimit(
    `rate-limit:center-activity:${clientKey}`,
    MAX_REQUESTS_PER_WINDOW,
    WINDOW_MS / 1000,
  )

  return result.limited
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
    const sendUserConfirmation = process.env.SEND_USER_CONFIRMATION !== 'false'
    if (process.env.RESEND_API_KEY && fromEmail && adminEmail) {
      let adminSent = false
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const from = `${process.env.BRAND_FROM_NAME || 'CE Joventut TT'} <${fromEmail}>`
        const admin = await resend.emails.send({
          from,
          to: adminEmail,
          replyTo: `${data.fullName} <${data.email}>`,
          subject: `Nueva inscripción al club — ${data.fullName} (${data.municipality})`,
          html: htmlAdmin(data),
        })
        if (admin.error || !admin.data) {
          throw new Error(`Resend admin email failed: ${admin.error?.message ?? 'empty response'}`)
        }
        adminSent = true

        if (sendUserConfirmation) {
          const confirmation = await resend.emails.send({
            from,
            to: data.email,
            replyTo: adminEmail,
            subject: 'Hemos recibido tu inscripción — CE Joventut TT',
            html: htmlUser(data),
          })
          if (confirmation.error || !confirmation.data) {
            throw new Error(`Resend confirmation email failed: ${confirmation.error?.message ?? 'empty response'}`)
          }
        }

        return NextResponse.json({ ok: true, id: admin.data?.id ?? null })
      } catch (error) {
        console.error('[center-activity] Resend failed; trying EmailJS fallback:', error)
        await sendEmailJsFallback(data, { sendAdmin: !adminSent, sendUser: sendUserConfirmation })
        return NextResponse.json({ ok: true, id: null, provider: 'emailjs' })
      }
    }

    await sendEmailJsFallback(data, { sendUser: sendUserConfirmation })
    return NextResponse.json({ ok: true, id: null, provider: 'emailjs' })
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
