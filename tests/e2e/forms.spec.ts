import { expect, test } from '@playwright/test'

const emailJsConfigured = Boolean(
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  && process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  && process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
)

test('contact form submits through EmailJS without sending a real email', async ({ page }) => {
  test.skip(!emailJsConfigured, 'EmailJS environment variables are not configured')

  let emailJsRequest = false
  await page.route('https://api.emailjs.com/**', async (route) => {
    emailJsRequest = true
    await route.fulfill({ status: 200, body: 'OK' })
  })

  await page.goto('/')

  const form = page.locator('#contact form')
  await form.locator('input').nth(0).fill('Ada')
  await form.locator('input').nth(1).fill('Lovelace')
  await form.locator('input[type="email"]').fill('ada@example.test')
  await form.locator('input[type="tel"]').fill('+34600111222')
  await form.locator('input').nth(4).fill('Consulta de prueba')
  await form.locator('textarea').fill('Mensaje de prueba sin envío real.')

  const dialog = page.waitForEvent('dialog')
  await form.getByRole('button', { name: /enviar mensaje/i }).click()
  const contactDialog = await dialog
  expect(contactDialog.message()).toContain('mensaje ha sido enviado')
  await contactDialog.accept()
  expect(emailJsRequest).toBe(true)
})

test('join form sends a valid application to the server endpoint', async ({ page }) => {
  let application: Record<string, unknown> | undefined
  await page.route('**/api/center-activity', async (route) => {
    application = route.request().postDataJSON() as Record<string, unknown>
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, id: 'test-application' }),
    })
  })

  await page.goto('/join')
  await page.locator('#fullName').fill('Ada Lovelace')
  await page.locator('#birthDate').fill('2000-01-01')
  await page.locator('#municipality').fill('Sant Josep')
  await page.locator('#phone').fill('+34600111222')
  await page.locator('#email').fill('ada@example.test')
  await page.locator('#referralSource').fill('Web')
  await page.locator('fieldset').nth(0).getByRole('radio', { name: /sí/i }).click()
  await page.locator('fieldset').nth(1).getByRole('radio', { name: /no/i }).click()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: /enviar inscripción/i }).click()

  await expect.poll(() => application).toEqual({
    fullName: 'Ada Lovelace',
    birthDate: '2000-01-01',
    municipality: 'Sant Josep',
    phone: '+34600111222',
    email: 'ada@example.test',
    referralSource: 'Web',
    competitionInterest: 'yes',
    eventInterest: 'no',
    dataProtectionConsent: true,
  })
})
