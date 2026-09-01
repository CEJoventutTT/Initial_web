/** @jest-environment node */
/// <reference types="jest" />

import { claimOutboxEntry, claimRetryableOutbox, markOutboxFailed, markOutboxSent } from '@/lib/email/outbox'
import { deliverEmail } from '@/lib/email/transport'
import { retryPendingEmail, submitEmail } from '@/lib/email/submit'

jest.mock('@/lib/email/outbox', () => ({
  claimOutboxEntry: jest.fn(), claimRetryableOutbox: jest.fn(), markOutboxFailed: jest.fn(), markOutboxSent: jest.fn(),
}))
jest.mock('@/lib/email/transport', () => ({ deliverEmail: jest.fn() }))

const notice = {
  firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '', subject: 'Consulta', message: 'Hola',
}

beforeEach(() => {
  jest.mocked(markOutboxSent).mockResolvedValue(undefined)
  jest.mocked(markOutboxFailed).mockResolvedValue(undefined)
  jest.mocked(deliverEmail).mockResolvedValue({ provider: 'emailjs', id: null })
})

afterEach(() => jest.resetAllMocks())

describe('email outbox submission', () => {
  it('does not re-send an already delivered idempotent entry', async () => {
    jest.mocked(claimOutboxEntry).mockResolvedValue({
      id: 'outbox-1', status: 'sent', idempotency_key: 'key', provider: 'emailjs', provider_id: null, should_send: false,
    })

    await expect(submitEmail('contact', notice, notice, notice)).resolves.toEqual({ provider: 'emailjs', id: null, duplicate: true })
    expect(deliverEmail).not.toHaveBeenCalled()
  })

  it('retries entries atomically claimed by the retry worker', async () => {
    jest.mocked(claimRetryableOutbox).mockResolvedValue([{
      id: 'outbox-2', status: 'sending', idempotency_key: 'key-2', provider: null, provider_id: null, should_send: true,
      flow: 'join', notice, acknowledgement: notice,
    }])

    await expect(retryPendingEmail()).resolves.toEqual({ claimed: 1, sent: 1, failed: 0 })
    expect(deliverEmail).toHaveBeenCalledWith('join', notice, notice, 'key-2')
    expect(markOutboxSent).toHaveBeenCalledWith('outbox-2', 'emailjs', null)
  })
})
