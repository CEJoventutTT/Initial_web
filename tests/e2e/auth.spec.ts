import { expect, test } from '@playwright/test'
import { credentials, login } from './helpers'

test.describe('authentication and role authorization', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('anonymous users are redirected away from admin', async ({ page }) => {
    await page.goto('/admin/user')
    await expect(page).toHaveURL(/\/login\?next=(?:%2F|\/)admin(?:%2F|\/)user$/)
  })

  test('administrator can open the user administration screen', async ({ page }) => {
    test.skip(!credentials('admin').configured, 'ADMIN/ACCES are not configured')
    await login(page, 'admin', '/admin/user')
    await expect(page.getByRole('heading', { name: 'Admin · Crear usuario' })).toBeVisible()
  })

  test('coach can open session management but not admin', async ({ page }) => {
    test.skip(!credentials('coach').configured, 'COACH/PASS are not configured')
    await login(page, 'coach', '/coach/sessions')
    await expect(page.getByRole('heading', { name: 'Panel del Coach' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sesiones de asistencia' }).first()).toBeVisible()

    await page.goto('/admin/user')
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('student reaches dashboard and is rejected from coach routes', async ({ page }) => {
    test.skip(!credentials('student').configured, 'STUDENT/STUDENT_PASS are not configured')
    await login(page, 'student')
    await expect(page.getByRole('heading', { name: 'Your Progress' })).toBeVisible()

    await page.goto('/coach/sessions')
    await expect(page).toHaveURL(/\/dashboard$/)
  })
})
