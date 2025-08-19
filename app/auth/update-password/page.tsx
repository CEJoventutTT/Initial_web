const { data, error } = await supabase.auth.updateUser({ password: '...' })
