import { test, expect } from '@playwright/test'
import { login } from './helpers'

// Read-only regression: a direct document load must settle without navigating elsewhere.
test('admin first document load and reload do not loop in the loading screen', async ({ page, context }) => {
  await login(page, 'admin', '/dashboard')
  const admin = await context.newPage()
  let documentRequests = 0
  admin.on('request', request => {
    if (request.isNavigationRequest() && new URL(request.url()).pathname === '/admin') documentRequests++
  })
  await admin.goto('/admin', { waitUntil: 'commit' })
  await expect(admin.getByRole('heading', { name: 'Resumen del club' })).toBeVisible({ timeout: 15000 })
  await admin.waitForLoadState('load')
  expect(documentRequests).toBe(1)
  await expect(admin.getByText('Cargando datos del club…')).toHaveCount(0)
  await admin.reload({ waitUntil: 'commit' })
  await expect(admin.getByRole('heading', { name: 'Resumen del club' })).toBeVisible({ timeout: 15000 })
  await admin.waitForLoadState('load')
  expect(documentRequests).toBe(2)
  await admin.close()
})
