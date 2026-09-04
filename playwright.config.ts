import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { defineConfig, devices } from '@playwright/test'

// Playwright deliberately never loads `.env`: E2E must target a dedicated project.
if (existsSync('.env.test.local')) loadEnvFile('.env.test.local')

for (const [target, source] of [['ADMIN', 'ADMIN2'], ['ADMIN_PASS', 'ADMIN_PASS2'], ['COACH', 'COACH2'], ['COACH_PASS', 'COACH_PASS2']] as const) {
  if (process.env[source]) process.env[target] = process.env[source]
}

const requiredCredentials = ['ADMIN', 'ADMIN_PASS', 'COACH', 'COACH_PASS', 'STUDENT', 'STUDENT_PASS']
if (process.env.E2E_TEST_ENV !== '1') {
  throw new Error('E2E_TEST_ENV=1 is required. Configure .env.test.local for a dedicated Supabase test project.')
}
if (process.env.CI || process.env.E2E_TEST_ENV === '1') {
  const missing = requiredCredentials.filter((name) => !process.env[name])
  if (missing.length > 0) {
    throw new Error(`Missing required E2E environment variables: ${missing.join(', ')}`)
  }
}

const port = Number(process.env.E2E_PORT || 3100)
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
