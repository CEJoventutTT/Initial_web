import { expect, test } from '@playwright/test'
import { credentials, login } from './helpers'

test.describe('coach and attendance flow', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('coach can open the QR page for an assigned session', async ({ page }) => {
    test.skip(!credentials('coach').configured, 'COACH/COACH_PASS are not configured')
    await login(page, 'coach', '/coach/sessions')

    const qrLink = page.getByRole('link', { name: 'Mostrar QR' }).first()
    await expect(qrLink).toBeVisible()
    await qrLink.click()
    await expect(page).toHaveURL(/\/coach\/sessions\/\d+\/qr$/)
    await expect(page.getByRole('heading', { name: 'QR de la sesión' })).toBeVisible()
  })

  test('student returns to attendance after login and invalid QR is rejected', async ({ page }) => {
    test.skip(!credentials('coach').configured, 'COACH/COACH_PASS are not configured')
    test.skip(!credentials('student').configured, 'STUDENT/STUDENT_PASS are not configured')

    await login(page, 'coach', '/coach/sessions')
    const qrHref = await page.getByRole('link', { name: 'Mostrar QR' }).first().getAttribute('href')
    expect(qrHref).toMatch(/^\/coach\/sessions\/\d+\/qr$/)
    const sessionId = qrHref?.match(/\/(\d+)\/qr$/)?.[1]
    expect(sessionId).toBeTruthy()

    await page.context().clearCookies()
    const attendPath = `/attend?s=${sessionId}&k=e2e-invalid-key`
    await page.goto(attendPath)
    await page.getByRole('link', { name: 'Iniciar sesión y volver al QR' }).click()
    await expect(page).toHaveURL(/\/login\?redirectTo=/)

    const account = credentials('student')
    await page.getByPlaceholder('Email').fill(account.email)
    await page.getByPlaceholder('Contraseña').fill(account.password)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(new RegExp(`/attend\\?s=${sessionId}&k=e2e-invalid-key$`))
    await expect(page.getByText(/Error: (invalid_key|session_expired|session_closed)/)).toBeVisible()
  })
})
