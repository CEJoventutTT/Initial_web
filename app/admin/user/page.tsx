import { authenticatedSupabase } from '@/lib/supabase/request-auth'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const { supabase } = await authenticatedSupabase()
  const [applicationsRes, profilesRes, programsRes] = await Promise.all([
    supabase.from('membership_applications').select('id, full_name, email, phone, municipality, birth_date, competition_interest, event_interest, status, internal_notes, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('user_id, full_name, role').order('full_name').limit(500),
    supabase.from('programs').select('id, name, active, coach_id').order('name').limit(100),
  ])

  return <AdminClient applications={applicationsRes.data ?? []} profiles={profilesRes.data ?? []} programs={programsRes.data ?? []} />
}
