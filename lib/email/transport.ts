import 'server-only'

import { Resend } from 'resend'
import type { TemplateParams } from '@/lib/email/contracts'
import type { OutboxEntry } from '@/lib/email/outbox'

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'
const PROVIDER_TIMEOUT_MS = 10_000

type EmailJsConfig = {
  serviceId: string
  contactTemplateId: string
  autoReplyTemplateId: string
  publicKey: string
  privateKey: string
}

export type DeliveryResult = {
  provider: 'emailjs' | 'resend'
  id: string | null
}

function getEmailJsConfig(): EmailJsConfig {
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const contactTemplateId = process.env.EMAILJS_CONTACT_TEMPLATE_ID
  const autoReplyTemplateId = process.env.EMAILJS_AUTO_REPLY_TEMPLATE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY

  if (!serviceId || !contactTemplateId || !autoReplyTemplateId || !publicKey || !privateKey) {
    throw new Error('EmailJS server configuration is incomplete')
  }

  return { serviceId, contactTemplateId, autoReplyTemplateId, publicKey, privateKey }
}

async function sendEmailJs(
  config: EmailJsConfig,
  templateId: string,
  templateParams: TemplateParams,
) {
  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: templateId,
      user_id: config.publicKey,
      accessToken: config.privateKey,
      template_params: templateParams,
    }),
  })

  if (!response.ok) throw new Error(`EmailJS request failed with status ${response.status}`)
}

async function sendWithEmailJs(kind: OutboxEntry['kind'], params: TemplateParams): Promise<DeliveryResult> {
  const config = getEmailJsConfig()
  const templateId = kind === 'notice' ? config.contactTemplateId : config.autoReplyTemplateId
  await sendEmailJs(config, templateId, params)
  return { provider: 'emailjs', id: null }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&gt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character)
}

function htmlMessage(params: TemplateParams) {
  return `<div style="font-family:system-ui,Arial"><h2>${escapeHtml(params.subject)}</h2><p>${escapeHtml(params.message).replace(/\n/g, '<br/>')}</p><hr/><p><b>Nombre:</b> ${escapeHtml(`${params.firstName} ${params.lastName}`.trim())}</p><p><b>Email:</b> ${escapeHtml(params.email)}</p><p><b>Teléfono:</b> ${escapeHtml(params.phone)}</p></div>`
}

async function sendWithResend(kind: OutboxEntry['kind'], params: TemplateParams, idempotencyKey: string): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.BRAND_FROM_EMAIL
  const inbox = process.env.REQUESTS_INBOX_EMAIL
  if (!apiKey || !fromEmail || !inbox) throw new Error('Resend server configuration is incomplete')

  const resend = new Resend(apiKey)
  const from = `${process.env.BRAND_FROM_NAME || 'CE Joventut TT'} <${fromEmail}>`
  const result = await resend.emails.send({
    from,
    to: kind === 'notice' ? inbox : params.email,
    replyTo: kind === 'notice' ? `${params.firstName} ${params.lastName} <${params.email}>` : inbox,
    subject: params.subject,
    html: htmlMessage(params),
  }, { headers: { 'Idempotency-Key': idempotencyKey } })
  if (result.error || !result.data) throw new Error(`Resend ${kind} failed: ${result.error?.message ?? 'empty response'}`)
  return { provider: 'resend', id: result.data.id }
}

export async function deliverEmail(
  kind: OutboxEntry['kind'],
  params: TemplateParams,
  idempotencyKey: string,
): Promise<DeliveryResult> {
  if (process.env.EMAIL_PROVIDER !== 'resend') {
    return sendWithEmailJs(kind, params)
  }

  try {
    return await sendWithResend(kind, params, idempotencyKey)
  } catch (error) {
    console.error('[email] Resend failed; using EmailJS fallback', error)
    return sendWithEmailJs(kind, params)
  }
}
