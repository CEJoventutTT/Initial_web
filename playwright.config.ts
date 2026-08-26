import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { defineConfig, devices } from '@playwright/test'

// `.env.test.local` is loaded first so its dedicated test credentials take priority.
for (const file of ['.env.test.local', '.env']) {
  if (existsSync(file)) loadEnvFile(file)
}

const requiredCredentials = ['ADMIN', 'ADMIN_PASS', 'COACH', 'COACH_PASS', 'STUDENT', 'STUDENT_PASS']
if (process.env.CI) {
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
