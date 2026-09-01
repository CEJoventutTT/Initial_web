import 'server-only'

import { createHash } from 'node:crypto'
import type { EmailFlow, TemplateParams } from '@/lib/email/contracts'
import { claimOutboxEntry, claimRetryableOutbox, markOutboxFailed, markOutboxSent } from '@/lib/email/outbox'
import { deliverEmail, type DeliveryResult } from '@/lib/email/transport'

export async function submitEmail(
  flow: EmailFlow,
  notice: TemplateParams,
  acknowledgement: TemplateParams,
  normalizedPayload: unknown,
): Promise<DeliveryResult & { duplicate: boolean }> {
  const idempotencyKey = createHash('sha256')
    .update(`${flow}:${JSON.stringify(normalizedPayload)}`)
    .digest('hex')
  const entry = await claimOutboxEntry(flow, idempotencyKey, notice, acknowledgement)

  if (!entry.should_send) {
    if (entry.status === 'sent' && (entry.provider === 'emailjs' || entry.provider === 'resend')) {
      return { provider: entry.provider, id: entry.provider_id, duplicate: true }
    }
    throw new Error('A delivery with these details is already being processed')
  }

  try {
    const result = await deliverEmail(flow, notice, acknowledgement, idempotencyKey)
    await markOutboxSent(entry.id, result.provider, result.id)
    return { ...result, duplicate: false }
  } catch (error) {
    await markOutboxFailed(entry.id, error)
    throw error
  }
}

export async function retryPendingEmail(maxEntries = 10) {
  const entries = await claimRetryableOutbox(maxEntries)
  let sent = 0
  let failed = 0
  for (const entry of entries) {
    try {
      const result = await deliverEmail(entry.flow, entry.notice, entry.acknowledgement, entry.idempotency_key)
      await markOutboxSent(entry.id, result.provider, result.id)
      sent += 1
    } catch (error) {
      await markOutboxFailed(entry.id, error)
      failed += 1
    }
  }
  return { claimed: entries.length, sent, failed }
}
