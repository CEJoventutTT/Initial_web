/** @jest-environment node */
/// <reference types="jest" />

import { POST } from '@/app/api/center-activity/route'
import { consumeRateLimit } from '@/lib/rate-limit'
import { Resend } from 'resend'

jest.mock('@/lib/rate-limit', () => ({ consumeRateLimit: jest.fn() }))
jest.mock('resend', () => ({ Resend: jest.fn() }))

const application = {
  fullName: 'Ada Lovelace',
  birthDate: '2000-01-01',
  municipality: 'Sant Josep',
  phone: '+34600111222',
  email: 'ada@example.test',
  referralSource: 'Web',
  competitionInterest: 'yes' as const,
  eventInterest: 'no' as const,
  dataProtectionConsent: true as const,
}

describe('center activity EmailJS fallback', () => {
  const originalEnv = { ...process.env }
  const fetchMock = jest.fn()
  const resendSend = jest.fn()

  beforeEach(() => {
    jest.mocked(consumeRateLimit).mockResolvedValue({ limited: false, remaining: 4 })
    Object.assign(process.env, {
      NEXT_PUBLIC_EMAILJS_SERVICE_ID: 'service_test',
      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: 'template_contact_test',
      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID2: 'template_auto_reply_test',
      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: 'public_test',
    })
    delete process.env.RESEND_API_KEY
    delete process.env.BRAND_FROM_EMAIL
    delete process.env.REQUESTS_INBOX_EMAIL
    fetchMock.mockResolvedValue(new Response('OK', { status: 200 }))
    global.fetch = fetchMock
    jest.mocked(Resend).mockImplementation(() => ({
      emails: { send: resendSend },
    }) as never)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  it('sends the club notice and applicant confirmation through EmailJS when Resend is unavailable', async () => {
    const response = await POST(new Request('http://localhost/api/center-activity', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(application),
    }))

    await expect(response.json()).resolves.toEqual({ ok: true, id: null, provider: 'emailjs' })
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const firstRequest = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(firstRequest).toMatchObject({
      service_id: 'service_test',
      template_id: 'template_contact_test',
      user_id: 'public_test',
      template_params: expect.objectContaining({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.test',
        subject: 'Nueva inscripción — Ada Lovelace',
      }),
    })

    const secondRequest = JSON.parse(fetchMock.mock.calls[1][1].body as string)
    expect(secondRequest).toMatchObject({
      template_id: 'template_auto_reply_test',
      template_params: expect.objectContaining({
        email: 'ada@example.test',
        subject: 'Hemos recibido tu inscripción — CE Joventut TT',
      }),
    })
  }, 5_000)

  it('uses EmailJS when Resend returns an error response instead of throwing', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    Object.assign(process.env, {
      RESEND_API_KEY: 're_test',
      BRAND_FROM_EMAIL: 'noreply@example.test',
      REQUESTS_INBOX_EMAIL: 'club@example.test',
    })
    resendSend.mockResolvedValue({
      data: null,
      error: { message: 'Provider rejected the request', statusCode: 422, name: 'validation_error' },
      headers: null,
    })

    const response = await POST(new Request('http://localhost/api/center-activity', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(application),
    }))

    await expect(response.json()).resolves.toEqual({ ok: true, id: null, provider: 'emailjs' })
    expect(resendSend).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  }, 5_000)
})
