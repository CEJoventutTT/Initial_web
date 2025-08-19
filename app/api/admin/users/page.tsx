'use client'
import { useState } from 'react'
import { createUserAdmin } from './actions'

export default function AdminUsersPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'student'|'coach'|'admin'|'parent'>('student')
  const [msg, setMsg] = useState<string | null>(null)

  async function onCreate() {
    setMsg(null)
    try {
      await createUserAdmin({ email, fullName: name, role })
      setMsg('Usuario creado y link enviado')
    } catch (e: any) {
      setMsg(`Error: ${e.message}`)
    }
  }

  return (
    <div>
      {/* ...inputs... */}
      <button onClick={onCreate}>Crear</button>
      {msg && <p>{msg}</p>}
    </div>
  )
}
