import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { loadEnvFile } from 'node:process'

const testEnvFile = '.env.test.local'
if (!existsSync(testEnvFile)) {
  console.error('Missing .env.test.local. Copy .env.test.example and configure a dedicated Supabase test project.')
  process.exit(1)
}
loadEnvFile(testEnvFile)

const credentialAliases = [
  ['ADMIN', 'ADMIN2'],
  ['ADMIN_PASS', 'ADMIN_PASS2'],
  ['COACH', 'COACH2'],
  ['COACH_PASS', 'COACH_PASS2'],
]

const required = [
  'E2E_TEST_ENV',
  'NEXT_PUBLIC_CEJTT_SUPABASE_URL',
  'NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY',
  ...credentialAliases.map(([, source]) => source),
  'STUDENT',
  'STUDENT_PASS',
]
const missing = required.filter((name) => !process.env[name])

if (process.env.E2E_TEST_ENV !== '1' || missing.length > 0) {
  console.error(`Invalid E2E test environment${missing.length ? `; missing: ${missing.join(', ')}` : ''}. Set E2E_TEST_ENV=1.`)
  process.exit(1)
}

if (
  process.env.E2E_BACKOFFICE_LOCAL === '1' &&
  process.env.NEXT_PUBLIC_CEJTT_SUPABASE_URL !== 'http://127.0.0.1:54321'
) {
  console.error('E2E_BACKOFFICE_LOCAL requires local Supabase at http://127.0.0.1:54321.')
  process.exit(1)
}
if (process.env.E2E_BACKOFFICE_LOCAL === '1' && process.env.E2E_BASE_URL) {
  const host = new URL(process.env.E2E_BASE_URL).hostname
  if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
    console.error('E2E_BACKOFFICE_LOCAL requires a local E2E_BASE_URL.')
    process.exit(1)
  }
}

for (const [target, source] of credentialAliases) {
  process.env[target] = process.env[source]
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const child = spawn(npx, ['playwright', 'test', ...process.argv.slice(2)], {
  env: process.env,
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0)
})
