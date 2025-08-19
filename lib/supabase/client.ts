
  import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import type { Database } from '@/types/supabase' // opcional si generaste tipos

export const supabaseBrowser = () =>
  createClientComponentClient(/* <Database> */)
