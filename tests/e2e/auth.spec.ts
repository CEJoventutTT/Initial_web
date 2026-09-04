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

  test('visitor can open public news and join pages', async ({ page }) => {
    await page.goto('/news')
    await expect(page).toHaveURL(/\/news$/)
    await page.goto('/join')
    await expect(page).toHaveURL(/\/join$/)
    await expect(page.locator('form')).toBeVisible()
  })

  test('administrator can open the user administration screen', async ({ page }) => {
    test.skip(!credentials('admin').configured, 'ADMIN/ADMIN_PASS are not configured')
    await login(page, 'admin', '/admin/user')
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible()
  })

  test('coach can open session management but not admin', async ({ page }) => {
    test.skip(!credentials('coach').configured, 'COACH/COACH_PASS are not configured')
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
