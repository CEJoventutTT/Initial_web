import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Application } from '@/lib/email/contracts'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'

export async function saveMembershipApplication(application: Application, requestKey: string) {
  const { url, serviceRoleKey } = requireSupabaseAdminConfig()
  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await admin.from('membership_applications').upsert({
    request_key: requestKey,
    full_name: application.fullName,
    birth_date: application.birthDate,
    municipality: application.municipality,
    phone: application.phone,
    email: application.email,
    referral_source: application.referralSource,
    competition_interest: application.competitionInterest,
    event_interest: application.eventInterest,
  }, { onConflict: 'request_key', ignoreDuplicates: true })

  if (error) throw new Error(`Unable to save membership application: ${error.message}`)
}
