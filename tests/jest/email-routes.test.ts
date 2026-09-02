/** @jest-environment node */
/// <reference types="jest" />

import { POST as contactPost } from '@/app/api/contact/route'
import { POST as joinPost } from '@/app/api/center-activity/route'
import { submitEmail } from '@/lib/email/submit'
import { consumeRateLimit } from '@/lib/rate-limit'

jest.mock('@/lib/email/submit', () => ({ submitEmail: jest.fn() }))
jest.mock('@/lib/rate-limit', () => ({ consumeRateLimit: jest.fn() }))

const joinApplication = {
  fullName: 'Ada Lovelace',
  birthDate: '2000-01-01',
  municipality: 'Sant Josep',
  phone: '+34600111222',
  email: 'ada@example.com',
  referralSource: 'Web',
  competitionInterest: 'yes',
  eventInterest: 'no',
  dataProtectionConsent: true,
}

beforeEach(() => {
  jest.mocked(consumeRateLimit).mockResolvedValue({ limited: false, remaining: 4 })
  jest.mocked(submitEmail).mockResolvedValue({ provider: 'emailjs', id: null, duplicate: false, pending: false })
})

afterEach(() => jest.resetAllMocks())

describe('email form routes', () => {
  it('queues and delivers a contact message through the server', async () => {
    const response = await contactPost(new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': 'contact-request-0001' },
      body: JSON.stringify({
        firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com',
        phone: '+34600111222', subject: 'Consulta', message: 'Mensaje de prueba',
      }),
    }))

    await expect(response.json()).resolves.toEqual({ ok: true, id: null, provider: 'emailjs', duplicate: false, pending: false })
    expect(submitEmail).toHaveBeenCalledWith('contact', expect.objectContaining({
      firstName: 'Ada', subject: 'Consulta', message: 'Mensaje de prueba',
    }), expect.objectContaining({
      subject: 'Hemos recibido tu mensaje — CE Joventut TT',
    }), 'contact-request-0001')
  })

  it('queues and delivers a club application through the server', async () => {
    const response = await joinPost(new Request('http://localhost/api/center-activity', {
      method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': 'join-request-0000001' }, body: JSON.stringify(joinApplication),
    }))

    await expect(response.json()).resolves.toEqual({ ok: true, id: null, provider: 'emailjs', duplicate: false, pending: false })
    expect(submitEmail).toHaveBeenCalledWith('join', expect.objectContaining({
      firstName: 'Ada', subject: 'Nueva inscripción — Ada Lovelace',
    }), expect.objectContaining({
      subject: 'Hemos recibido tu inscripción — CE Joventut TT',
    }), 'join-request-0000001')
  })

  it('does not call the provider when the contact rate limit is exhausted', async () => {
    jest.mocked(consumeRateLimit).mockResolvedValue({ limited: true, remaining: 0 })
    const response = await contactPost(new Request('http://localhost/api/contact', {
      method: 'POST', headers: { 'idempotency-key': 'contact-request-0002' }, body: '{}',
    }))
    expect(response.status).toBe(429)
    expect(submitEmail).not.toHaveBeenCalled()
  })

  it('reports accepted-but-pending delivery with HTTP 202', async () => {
    jest.mocked(submitEmail).mockResolvedValue({ provider: 'resend', id: 'notice-1', duplicate: false, pending: true })
    const response = await contactPost(new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': 'contact-request-0003' },
      body: JSON.stringify({
        firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com',
        phone: '', subject: 'Consulta', message: 'Mensaje de prueba',
      }),
    }))

    expect(response.status).toBe(202)
    await expect(response.json()).resolves.toEqual({ ok: true, id: 'notice-1', provider: 'resend', duplicate: false, pending: true })
  })
})
