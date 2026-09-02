import 'server-only'

import type { EmailFlow, TemplateParams } from '@/lib/email/contracts'
import { claimOutboxEntries, claimRetryableDeliveries, markDeliveryFailed, markDeliverySent } from '@/lib/email/outbox'
import { deliverEmail, type DeliveryResult } from '@/lib/email/transport'

export async function submitEmail(
  flow: EmailFlow,
  notice: TemplateParams,
  acknowledgement: TemplateParams,
  requestKey: string,
): Promise<DeliveryResult & { duplicate: boolean; pending: boolean }> {
  const entries = await claimOutboxEntries(flow, requestKey, notice, acknowledgement)
  const claimed = entries.filter((entry) => entry.should_send)
  if (claimed.length === 0) {
    const sent = entries.find((entry) => entry.status === 'sent' && (entry.provider === 'emailjs' || entry.provider === 'resend'))
    if (sent) {
      return {
        provider: sent.provider as DeliveryResult['provider'],
        id: sent.provider_id,
        duplicate: true,
        pending: entries.some((entry) => entry.status !== 'sent'),
      }
    }
    throw new Error('A delivery with this request id is already being processed')
  }

  let result: DeliveryResult | null = null
  for (const entry of claimed) {
    try {
      result = await deliverEmail(entry.kind, entry.template, entry.idempotency_key)
      await markDeliverySent(entry.id, result.provider, result.id)
    } catch (error) {
      await markDeliveryFailed(entry.id, error)
      if (result) return { ...result, duplicate: false, pending: true }
      throw error
    }
  }
  if (!result) throw new Error('No email deliveries were claimed')
  return { ...result, duplicate: false, pending: false }
}

export async function retryPendingEmail(maxEntries = 10) {
  const entries = await claimRetryableDeliveries(maxEntries)
  let sent = 0
  let failed = 0
  for (const entry of entries) {
    try {
      const result = await deliverEmail(entry.kind, entry.template, entry.idempotency_key)
      await markDeliverySent(entry.id, result.provider, result.id)
      sent += 1
    } catch (error) {
      await markDeliveryFailed(entry.id, error)
      failed += 1
    }
  }
  return { claimed: entries.length, sent, failed }
}
