import { z } from 'zod'

export const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional().default(''),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(1).max(5_000),
})

export const applicationSchema = z.object({
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

export type ContactMessage = z.infer<typeof contactSchema>
export type Application = z.infer<typeof applicationSchema>
export type EmailFlow = 'contact' | 'join'

export type TemplateParams = {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
}

const interestLabel = (value: Application['competitionInterest'] | Application['eventInterest']) =>
  ({ yes: 'Sí', no: 'No', later: 'Más adelante' })[value]

export function contactTemplateParams(data: ContactMessage): TemplateParams {
  return data
}

export function joinTemplateParams(data: Application): TemplateParams {
  const [firstName, ...lastNameParts] = data.fullName.split(/\s+/)
  return {
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
}

export function acknowledgementParams(flow: EmailFlow, params: TemplateParams): TemplateParams {
  return {
    ...params,
    subject: flow === 'join'
      ? 'Hemos recibido tu inscripción — CE Joventut TT'
      : 'Hemos recibido tu mensaje — CE Joventut TT',
    message: flow === 'join'
      ? 'Hemos recibido tus datos para formar parte del Club Esportiu Joventut TT. Nos pondremos en contacto contigo para empezar los entrenamientos.'
      : 'Hemos recibido tu mensaje. Te responderemos lo antes posible.',
  }
}
