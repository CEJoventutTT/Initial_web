/** @jest-environment node */
/// <reference types="jest" />

import { claimOutboxEntries, claimRetryableDeliveries, markDeliveryFailed, markDeliverySent } from '@/lib/email/outbox'
import { deliverEmail } from '@/lib/email/transport'
import { retryPendingEmail, submitEmail } from '@/lib/email/submit'

jest.mock('@/lib/email/outbox', () => ({
  claimOutboxEntries: jest.fn(), claimRetryableDeliveries: jest.fn(), markDeliveryFailed: jest.fn(), markDeliverySent: jest.fn(),
}))
jest.mock('@/lib/email/transport', () => ({ deliverEmail: jest.fn() }))

const notice = {
  firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '', subject: 'Consulta', message: 'Hola',
}

beforeEach(() => {
  jest.mocked(markDeliverySent).mockResolvedValue(undefined)
  jest.mocked(markDeliveryFailed).mockResolvedValue(undefined)
  jest.mocked(deliverEmail).mockResolvedValue({ provider: 'emailjs', id: null })
})

afterEach(() => jest.resetAllMocks())

describe('email outbox submission', () => {
  it('does not re-send an already delivered idempotent entry', async () => {
    jest.mocked(claimOutboxEntries).mockResolvedValue([{
      id: 'outbox-1', status: 'sent', kind: 'notice', idempotency_key: 'key:notice', provider: 'emailjs', provider_id: null, template: notice, should_send: false,
    }, {
      id: 'outbox-2', status: 'sent', kind: 'acknowledgement', idempotency_key: 'key:acknowledgement', provider: 'emailjs', provider_id: null, template: notice, should_send: false,
    }])

    await expect(submitEmail('contact', notice, notice, 'request-key-000001')).resolves.toEqual({ provider: 'emailjs', id: null, duplicate: true, pending: false })
    expect(deliverEmail).not.toHaveBeenCalled()
  })

  it('does not repeat a delivered notice when the acknowledgement fails', async () => {
    jest.mocked(claimOutboxEntries).mockResolvedValue([{
      id: 'notice-1', status: 'sending', kind: 'notice', idempotency_key: 'request-3:notice', provider: null, provider_id: null, template: notice, should_send: true,
    }, {
      id: 'ack-1', status: 'sending', kind: 'acknowledgement', idempotency_key: 'request-3:acknowledgement', provider: null, provider_id: null, template: notice, should_send: true,
    }])
    jest.mocked(deliverEmail)
      .mockResolvedValueOnce({ provider: 'resend', id: 'notice-provider-id' })
      .mockRejectedValueOnce(new Error('acknowledgement rejected'))

    await expect(submitEmail('contact', notice, notice, 'request-key-000003')).resolves.toEqual({
      provider: 'resend', id: 'notice-provider-id', duplicate: false, pending: true,
    })
    expect(markDeliverySent).toHaveBeenCalledWith('notice-1', 'resend', 'notice-provider-id')
    expect(markDeliveryFailed).toHaveBeenCalledWith('ack-1', expect.any(Error))
  })

  it('retries entries atomically claimed by the retry worker', async () => {
    jest.mocked(claimRetryableDeliveries).mockResolvedValue([{
      id: 'outbox-2', status: 'sending', kind: 'acknowledgement', idempotency_key: 'key-2:acknowledgement', provider: null, provider_id: null, should_send: true,
      flow: 'join', template: notice,
    }])

    await expect(retryPendingEmail()).resolves.toEqual({ claimed: 1, sent: 1, failed: 0 })
    expect(deliverEmail).toHaveBeenCalledWith('acknowledgement', notice, 'key-2:acknowledgement')
    expect(markDeliverySent).toHaveBeenCalledWith('outbox-2', 'emailjs', null)
  })
})
