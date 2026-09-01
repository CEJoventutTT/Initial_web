import 'server-only'

import { Resend } from 'resend'
import type { EmailFlow, TemplateParams } from '@/lib/email/contracts'

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'
const EMAILJS_MIN_INTERVAL_MS = 1_100
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

async function sendWithEmailJs(notice: TemplateParams, acknowledgement: TemplateParams): Promise<DeliveryResult> {
  const config = getEmailJsConfig()
  await sendEmailJs(config, config.contactTemplateId, notice)
  await new Promise((resolve) => setTimeout(resolve, EMAILJS_MIN_INTERVAL_MS))
  await sendEmailJs(config, config.autoReplyTemplateId, acknowledgement)
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

async function sendWithResend(notice: TemplateParams, acknowledgement: TemplateParams, idempotencyKey: string): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.BRAND_FROM_EMAIL
  const inbox = process.env.REQUESTS_INBOX_EMAIL
  if (!apiKey || !fromEmail || !inbox) throw new Error('Resend server configuration is incomplete')

  const resend = new Resend(apiKey)
  const from = `${process.env.BRAND_FROM_NAME || 'CE Joventut TT'} <${fromEmail}>`
  const noticeResult = await resend.emails.send({
    from,
    to: inbox,
    replyTo: `${notice.firstName} ${notice.lastName} <${notice.email}>`,
    subject: notice.subject,
    html: htmlMessage(notice),
  }, { headers: { 'Idempotency-Key': `${idempotencyKey}:notice` } })
  if (noticeResult.error || !noticeResult.data) {
    throw new Error(`Resend club notice failed: ${noticeResult.error?.message ?? 'empty response'}`)
  }

  const acknowledgementResult = await resend.emails.send({
    from,
    to: acknowledgement.email,
    replyTo: inbox,
    subject: acknowledgement.subject,
    html: htmlMessage(acknowledgement),
  }, { headers: { 'Idempotency-Key': `${idempotencyKey}:acknowledgement` } })
  if (acknowledgementResult.error || !acknowledgementResult.data) {
    throw new Error(`Resend acknowledgement failed: ${acknowledgementResult.error?.message ?? 'empty response'}`)
  }

  return { provider: 'resend', id: noticeResult.data.id }
}

export async function deliverEmail(
  flow: EmailFlow,
  notice: TemplateParams,
  acknowledgement: TemplateParams,
  idempotencyKey: string,
): Promise<DeliveryResult> {
  if (process.env.EMAIL_PROVIDER !== 'resend') {
    return sendWithEmailJs(notice, acknowledgement)
  }

  try {
    return await sendWithResend(notice, acknowledgement, idempotencyKey)
  } catch (error) {
    console.error('[email] Resend failed; using EmailJS fallback', error)
    return sendWithEmailJs(notice, acknowledgement)
  }
}
