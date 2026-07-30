import { expect, type Page } from '@playwright/test'

type Role = 'admin' | 'coach' | 'student'

const roleEnv: Record<Role, { email: string; password: string }> = {
  admin: { email: 'ADMIN', password: 'ACCES' },
  coach: { email: 'COACH', password: 'PASS' },
  student: { email: 'STUDENT', password: 'STUDENT_PASS' },
}

export function credentials(role: Role) {
  const names = roleEnv[role]
  return {
    email: process.env[names.email] || '',
    password: process.env[names.password] || '',
    configured: Boolean(process.env[names.email] && process.env[names.password]),
  }
}

export async function login(page: Page, role: Role, redirect = '/dashboard') {
  const account = credentials(role)
  expect(account.configured, `Missing ${role} E2E credentials`).toBe(true)

  await page.goto(`/login?next=${encodeURIComponent(redirect)}`)
  await page.getByPlaceholder('Email').fill(account.email)
  await page.getByPlaceholder('Contraseña').fill(account.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(new RegExp(`${escapeRegex(redirect)}(?:\\?.*)?$`))
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
