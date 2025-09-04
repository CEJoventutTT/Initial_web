import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const Schema = z.object({
  // Centro / entidad
  centerName: z.string().min(1),
  orgType: z.string().optional().nullable(),
  municipality: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  locationNotes: z.string().optional().nullable(),

  // Contacto
  contactPerson: z.string().min(1),
  role: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().min(3),

  // Participantes
  participantProfile: z.string().optional().nullable(),
  ageRange: z.string().optional().nullable(),
  numParticipants: z.string().optional().nullable(),
  specialNeeds: z.string().optional().nullable(),
  accessibility: z.string().optional().nullable(),

  // Planificación
  preferredDays: z.array(z.string()).default([]),
  preferredTime: z.string().optional().nullable(),
  frequencyPerWeek: z.string().optional().nullable(),
  sessionDuration: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),

  // Espacio / material
  tablesAvailable: z.boolean().optional().default(false),
  spaceAvailable: z.boolean().optional().default(false),
  equipmentNotes: z.string().optional().nullable(),

  // Otros
  objectives: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  // Consentimiento
  agreeTerms: z.boolean(),
  agreeNewsletter: z.boolean().optional().default(false),
})

function htmlAdmin(d: z.infer<typeof Schema>) {
  const yesno = (b?: boolean) => (b ? 'Sí' : 'No')
  return `
  <div style="font-family:system-ui,Arial">
    <h2>Nueva solicitud de actividad</h2>
    <p><b>Centro:</b> ${d.centerName}</p>
    <p><b>Tipo:</b> ${d.orgType ?? '-'}</p>
    <p><b>Municipio:</b> ${d.municipality ?? '-'}</p>
    <p><b>Dirección:</b> ${d.address ?? '-'}</p>
    <p><b>Ubicación / notas:</b> ${d.locationNotes ?? '-'}</p>
    <hr/>
    <p><b>Contacto:</b> ${d.contactPerson} (${d.role ?? '-'})</p>
    <p><b>Email:</b> ${d.email} — <b>Tel.:</b> ${d.phone}</p>
    <hr/>
    <p><b>Participantes:</b> ${d.participantProfile ?? '-'} | <b>Edad:</b> ${d.ageRange ?? '-'} | <b>Nº:</b> ${d.numParticipants ?? '-'}</p>
    <p><b>Necesidades:</b> ${d.specialNeeds ?? '-'}</p>
    <p><b>Accesibilidad:</b> ${d.accessibility ?? '-'}</p>
    <hr/>
    <p><b>Días:</b> ${d.preferredDays.join(', ') || '-'}</p>
    <p><b>Franja:</b> ${d.preferredTime ?? '-'}</p>
    <p><b>Frecuencia/semana:</b> ${d.frequencyPerWeek ?? '-'}</p>
    <p><b>Duración sesión:</b> ${d.sessionDuration ?? '-'}</p>
    <p><b>Inicio:</b> ${d.startDate ?? '-'}</p>
    <hr/>
    <p><b>Mesas:</b> ${yesno(d.tablesAvailable)} | <b>Espacio:</b> ${yesno(d.spaceAvailable)}</p>
    <p><b>Material/notas:</b> ${d.equipmentNotes ?? '-'}</p>
    <hr/>
    <p><b>Objetivos:</b> ${d.objectives ?? '-'}</p>
    <p><b>Notas:</b> ${d.notes ?? '-'}</p>
    <hr/>
    <p><b>Consentimiento:</b> Términos ${yesno(d.agreeTerms)} · Newsletter ${yesno(d.agreeNewsletter)}</p>
  </div>`
}

function htmlUser(d: z.infer<typeof Schema>) {
  return `
  <div style="font-family:system-ui,Arial">
    <p>Hola ${d.contactPerson},</p>
    <p>Hemos recibido la solicitud para <b>${d.centerName}</b>. En breve nos pondremos en contacto.</p>
    <p><b>Resumen:</b><br/>
       Municipio: ${d.municipality ?? '-'}<br/>
       Preferencias: ${d.preferredDays.join(', ') || '-'} — ${d.preferredTime ?? '-'}<br/>
       Objetivos: ${d.objectives ?? '-'}
    </p>
    <p>Saludos,<br/>CE Joventut TT</p>
  </div>`
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const d = Schema.parse(payload)

    const FROM = `${process.env.BRAND_FROM_NAME || 'CE Joventut TT'} <${process.env.BRAND_FROM_EMAIL!}>`
    const ADMIN = process.env.REQUESTS_INBOX_EMAIL!

    // 1) Aviso interno (puedes añadir cc/bcc si quieres)
    const admin = await resend.emails.send({
      from: FROM,
      to: ADMIN,
      reply_to: `${d.contactPerson} <${d.email}>`, // si respondéis, le contestáis al solicitante
      subject: `Nueva solicitud — ${d.centerName} (${d.municipality ?? '-'}) — ${d.contactPerson}`,
      html: htmlAdmin(d),
    })

    // 2) Auto-reply al usuario (opcional)
    if (process.env.SEND_USER_CONFIRMATION !== 'false') {
      await resend.emails.send({
        from: FROM,
        to: d.email,
        reply_to: ADMIN, // si el usuario responde, os llega a vuestro Gmail
        subject: `Hemos recibido tu solicitud — ${d.centerName}`,
        html: htmlUser(d),
      })
    }

    return NextResponse.json({ ok: true, id: admin?.id ?? null })
  } catch (err: any) {
    console.error('[center-activity] error:', err)
    return NextResponse.json(
      { ok: false, error: err?.message || 'SEND_FAILED' },
      { status: 400 },
    )
  }
}
