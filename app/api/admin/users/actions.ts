// app/admin/users/actions.ts
'use server'

export async function createUserAdmin(input: {
  email: string
  fullName?: string
  role: 'student'|'coach'|'admin'|'parent'
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/users`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-admin-key': process.env.ADMIN_API_KEY!, // <-- se usa en el servidor
    },
    body: JSON.stringify(input),
    cache: 'no-store',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Failed to create user')
  }
  return await res.json()
}
