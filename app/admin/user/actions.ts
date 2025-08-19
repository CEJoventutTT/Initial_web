// app/admin/users/actions.ts
'use server'

type Role = 'student' | 'coach' | 'admin' | 'parent'

type FormState = { ok?: boolean; error?: string | null; message?: string | null }

/**
 * Server Action que llama a tu API interna con la ADMIN_API_KEY
 * Se usa desde un <form action={...}> con useFormState en el cliente.
 */
export async function createUserAdmin(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim()
  const fullName = String(formData.get('fullName') ?? '').trim()
  const role = String(formData.get('role') ?? 'student') as Role

  if (!email) return { error: 'Email requerido' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Email no válido' }
  if (!['student', 'coach', 'admin', 'parent'].includes(role)) return { error: 'Rol no válido' }

  // Detecta base URL en server (Vercel/local)
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const res = await fetch(`${base}/api/admin/user`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // clave admin SOLO en servidor, nunca en cliente
      'x-admin-key': process.env.ADMIN_API_KEY ?? '',
    },
    body: JSON.stringify({ email, fullName, role }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return { error: data?.error ?? 'Error creando el usuario' }
  }

  return { ok: true, message: 'Usuario creado y link enviado' }
}
