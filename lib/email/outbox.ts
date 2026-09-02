import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { EmailFlow, TemplateParams } from '@/lib/email/contracts'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'

export type OutboxEntry = {
  id: string
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'unknown'
  kind: 'notice' | 'acknowledgement'
  idempotency_key: string
  provider: string | null
  provider_id: string | null
  template: TemplateParams
  should_send: boolean
}

type RetryEntry = OutboxEntry & {
  flow: EmailFlow
}

function adminClient() {
  const { url, serviceRoleKey } = requireSupabaseAdminConfig()
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function claimOutboxEntries(
  flow: EmailFlow,
  requestKey: string,
  notice: TemplateParams,
  acknowledgement: TemplateParams,
): Promise<OutboxEntry[]> {
  const { data, error } = await adminClient().rpc('claim_email_deliveries', {
    p_flow: flow,
    p_request_key: requestKey,
    p_notice: notice,
    p_acknowledgement: acknowledgement,
  })
  if (error || !data) throw new Error(`Unable to claim email deliveries: ${error?.message ?? 'empty response'}`)
  return data as OutboxEntry[]
}

export async function markDeliverySent(id: string, provider: string, providerId: string | null) {
  const { error } = await adminClient().rpc('mark_email_delivery_sent', {
    p_id: id,
    p_provider: provider,
    p_provider_id: providerId,
  })
  if (error) throw new Error(`Unable to mark email outbox entry as sent: ${error.message}`)
}

export async function markDeliveryFailed(id: string, error: unknown) {
  const technicalError = error instanceof Error ? error.message.slice(0, 500) : 'Unknown delivery error'
  const { error: updateError } = await adminClient().rpc('mark_email_delivery_failed', {
    p_id: id,
    p_error: technicalError,
  })
  if (updateError) console.error('[email] Unable to record outbox failure', updateError.message)
}

export async function claimRetryableDeliveries(limit: number): Promise<RetryEntry[]> {
  const { data, error } = await adminClient().rpc('claim_retryable_email_deliveries', { p_limit: limit })
  if (error) throw new Error(`Unable to claim retryable email deliveries: ${error.message}`)
  return (data ?? []) as RetryEntry[]
}
