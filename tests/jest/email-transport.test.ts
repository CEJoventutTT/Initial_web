/** @jest-environment node */
/// <reference types="jest" />

import { Resend } from 'resend'
import { deliverEmail } from '@/lib/email/transport'

jest.mock('resend', () => ({ Resend: jest.fn() }))

const notice = {
  firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '+34600111222',
  subject: 'Consulta', message: 'Mensaje de prueba',
}
const acknowledgement = { ...notice, subject: 'Confirmación', message: 'Recibido' }

describe('email transport', () => {
  const originalEnv = { ...process.env }
  const fetchMock = jest.fn()

  beforeEach(() => {
    Object.assign(process.env, {
      EMAILJS_SERVICE_ID: 'service_test',
      EMAILJS_CONTACT_TEMPLATE_ID: 'template_contact_test',
      EMAILJS_AUTO_REPLY_TEMPLATE_ID: 'template_auto_reply_test',
      EMAILJS_PUBLIC_KEY: 'public_test',
      EMAILJS_PRIVATE_KEY: 'private_test',
    })
    delete process.env.EMAIL_PROVIDER
    fetchMock.mockResolvedValue(new Response('OK', { status: 200 }))
    global.fetch = fetchMock
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.resetAllMocks()
  })

  it('sends the club notice and acknowledgement through EmailJS server credentials', async () => {
    await expect(deliverEmail('notice', notice, 'request-1:notice')).resolves.toEqual({ provider: 'emailjs', id: null })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({
      service_id: 'service_test', template_id: 'template_contact_test', accessToken: 'private_test', template_params: notice,
    })
  }, 5_000)

  it('falls back to EmailJS when enabled Resend returns an error response', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    process.env.EMAIL_PROVIDER = 'resend'
    Object.assign(process.env, {
      RESEND_API_KEY: 're_test', BRAND_FROM_EMAIL: 'noreply@example.com', REQUESTS_INBOX_EMAIL: 'club@example.com',
    })
    const send = jest.fn().mockResolvedValue({ data: null, error: { message: 'Rejected' } })
    jest.mocked(Resend).mockImplementation(() => ({ emails: { send } }) as never)

    await expect(deliverEmail('acknowledgement', acknowledgement, 'request-2:acknowledgement')).resolves.toEqual({ provider: 'emailjs', id: null })
    expect(send).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }, 5_000)
})
