import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { EmailFlow, TemplateParams } from '@/lib/email/contracts'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'

export type OutboxEntry = {
  id: string
  status: 'pending' | 'sending' | 'sent' | 'failed'
  idempotency_key: string
  provider: string | null
  provider_id: string | null
  should_send: boolean
}

type RetryEntry = OutboxEntry & {
  flow: EmailFlow
  notice: TemplateParams
  acknowledgement: TemplateParams
}

function adminClient() {
  const { url, serviceRoleKey } = requireSupabaseAdminConfig()
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function claimOutboxEntry(
  flow: EmailFlow,
  idempotencyKey: string,
  notice: TemplateParams,
  acknowledgement: TemplateParams,
): Promise<OutboxEntry> {
  const { data, error } = await adminClient().rpc('claim_email_outbox', {
    p_flow: flow,
    p_idempotency_key: idempotencyKey,
    p_notice: notice,
    p_acknowledgement: acknowledgement,
  })
  if (error || !data?.[0]) throw new Error(`Unable to claim email outbox entry: ${error?.message ?? 'empty response'}`)
  return data[0] as OutboxEntry
}

export async function markOutboxSent(id: string, provider: string, providerId: string | null) {
  const { error } = await adminClient().rpc('mark_email_outbox_sent', {
    p_id: id,
    p_provider: provider,
    p_provider_id: providerId,
  })
  if (error) throw new Error(`Unable to mark email outbox entry as sent: ${error.message}`)
}

export async function markOutboxFailed(id: string, error: unknown) {
  const technicalError = error instanceof Error ? error.message.slice(0, 500) : 'Unknown delivery error'
  const { error: updateError } = await adminClient().rpc('mark_email_outbox_failed', {
    p_id: id,
    p_error: technicalError,
  })
  if (updateError) console.error('[email] Unable to record outbox failure', updateError.message)
}

export async function claimRetryableOutbox(limit: number): Promise<RetryEntry[]> {
  const { data, error } = await adminClient().rpc('claim_retryable_email_outbox', { p_limit: limit })
  if (error) throw new Error(`Unable to claim retryable email outbox entries: ${error.message}`)
  return (data ?? []) as RetryEntry[]
}
