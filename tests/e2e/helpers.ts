import { expect, type Page } from '@playwright/test'

type Role = 'admin' | 'coach' | 'student'

const roleEnv: Record<Role, { email: string; password: string }> = {
  admin: { email: 'ADMIN', password: 'ADMIN_PASS' },
  coach: { email: 'COACH', password: 'COACH_PASS' },
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
  const rejectCookies = page.getByRole('button', { name: 'Rechazar', exact: true })
  if (await rejectCookies.isVisible()) await rejectCookies.click()
  await page.getByPlaceholder('Email').fill(account.email)
  await page.getByPlaceholder('Contraseña').fill(account.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(new RegExp(`${escapeRegex(redirect === '/admin/user' ? '/admin/people' : redirect)}(?:\\?.*)?$`))
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
