import nextEnv from '@next/env'
import { Resend } from 'resend'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const options = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.replace(/^--/, '').split('=')
    return [key, value.join('=') || true]
  }),
)

const provider = String(options.provider || 'all').toLowerCase()
const resendRecipient = String(options.to || process.env.REQUESTS_INBOX_EMAIL || '')
const dryRun = options['dry-run'] === true
const allowedProviders = new Set(['all', 'emailjs', 'resend'])

if (!allowedProviders.has(provider)) {
  throw new Error('Usa --provider=emailjs, --provider=resend o --provider=all')
}

if ((provider === 'all' || provider === 'resend') && !resendRecipient) {
  throw new Error('Indica --to=correo@dominio.com o configura REQUESTS_INBOX_EMAIL')
}

const timestamp = new Date().toISOString()

function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name])
  if (missing.length) throw new Error(`Faltan variables: ${missing.join(', ')}`)
}

async function testEmailJs() {
  requireEnv([
    'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
    'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
    'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
  ])

  if (dryRun) return { provider: 'EmailJS', result: 'configuración válida (sin enviar)' }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY || undefined,
      template_params: {
        firstName: 'Prueba',
        lastName: 'EmailJS',
        email: process.env.REQUESTS_INBOX_EMAIL || 'test@example.com',
        phone: 'No aplica',
        subject: `Prueba EmailJS — ${timestamp}`,
        message: `Correo de prueba de integración enviado el ${timestamp}.`,
      },
    }),
  })
  const body = await response.text()

  if (!response.ok) {
    const hint =
      response.status === 403
        ? ' Activa “Allow EmailJS API for non-browser applications” o ejecuta la prueba desde el formulario web.'
        : ''
    throw new Error(`EmailJS respondió HTTP ${response.status}: ${body}.${hint}`)
  }

  return {
    provider: 'EmailJS',
    result: `aceptado (HTTP ${response.status}); destinatario definido por la plantilla`,
  }
}

async function testResend() {
  requireEnv(['RESEND_API_KEY', 'BRAND_FROM_EMAIL'])

  if (dryRun) return { provider: 'Resend', result: 'configuración válida (sin enviar)' }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: `${process.env.BRAND_FROM_NAME || 'CE Joventut TT'} <${process.env.BRAND_FROM_EMAIL}>`,
    to: resendRecipient,
    subject: `Prueba Resend — ${timestamp}`,
    text: `Correo de prueba de integración enviado el ${timestamp}.`,
  })

  if (error) {
    throw new Error(`Resend respondió: ${error.name || 'error'} — ${error.message}`)
  }

  return { provider: 'Resend', result: `aceptado (id: ${data?.id || 'sin id'})` }
}

const tests = provider === 'all'
  ? [testEmailJs, testResend]
  : [provider === 'emailjs' ? testEmailJs : testResend]

let failed = false
for (const test of tests) {
  try {
    const outcome = await test()
    console.log(`✓ ${outcome.provider}: ${outcome.result}`)
  } catch (error) {
    failed = true
    console.error(`✗ ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failed) process.exitCode = 1
