import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const Schema = z.object({
  fullName: z.string().trim().min(1),
  birthDate: z.string().date(),
  municipality: z.string().trim().min(1),
  phone: z.string().trim().min(3),
  email: z.string().email(),
  referralSource: z.string().trim().min(1),
  competitionInterest: z.enum(['yes', 'no', 'later']),
  eventInterest: z.enum(['yes', 'no']),
  dataProtectionConsent: z.literal(true),
})

type Application = z.infer<typeof Schema>

const interestLabel = (value: Application['competitionInterest'] | Application['eventInterest']) =>
  ({ yes: 'Sí', no: 'No', later: 'Más adelante' })[value]

function htmlAdmin(data: Application) {
  return `
  <div style="font-family:system-ui,Arial">
    <h2>Nueva inscripción al club</h2>
    <p><b>Nombre y apellidos:</b> ${data.fullName}</p>
    <p><b>Fecha de nacimiento:</b> ${data.birthDate}</p>
    <p><b>Municipio de residencia:</b> ${data.municipality}</p>
    <p><b>Teléfono:</b> ${data.phone}</p>
    <p><b>Correo electrónico:</b> ${data.email}</p>
    <p><b>¿Cómo nos ha conocido?:</b> ${data.referralSource}</p>
    <hr/>
    <p><b>Interés en competiciones:</b> ${interestLabel(data.competitionInterest)}</p>
    <p><b>Interés en campus, torneos y eventos:</b> ${interestLabel(data.eventInterest)}</p>
    <hr/>
    <p><b>Protección de datos:</b> Consentimiento aceptado</p>
  </div>`
}

function htmlUser(data: Application) {
  return `
  <div style="font-family:system-ui,Arial">
    <p>Hola ${data.fullName},</p>
    <p>Hemos recibido tus datos para formar parte del Club Esportiu Joventut TT.</p>
    <p>Nos pondremos en contacto contigo para empezar los entrenamientos.</p>
    <p>Saludos,<br/>CE Joventut TT</p>
  </div>`
}

export async function POST(request: Request) {
  try {
    const data = Schema.parse(await request.json())
    const validateOnly = new URL(request.url).searchParams.get('validateOnly') === 'true'

    if (validateOnly) {
      return NextResponse.json({ ok: true })
    }

    const from = `${process.env.BRAND_FROM_NAME || 'CE Joventut TT'} <${process.env.BRAND_FROM_EMAIL!}>`
    const adminEmail = process.env.REQUESTS_INBOX_EMAIL!

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
  } catch (error: any) {
    console.error('[center-activity] error:', error)
    return NextResponse.json(
      { ok: false, error: error?.message || 'SEND_FAILED' },
      { status: 400 },
    )
  }
}
