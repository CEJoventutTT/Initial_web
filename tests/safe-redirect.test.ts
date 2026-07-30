import assert from 'node:assert/strict'
import test from 'node:test'
import { safeInternalRedirect } from '../lib/safe-redirect.ts'

test('accepts local paths including query strings', () => {
  assert.equal(
    safeInternalRedirect('/attend?s=12&k=abc'),
    '/attend?s=12&k=abc',
  )
})

test('rejects absolute and protocol-relative redirects', () => {
  assert.equal(safeInternalRedirect('https://evil.example/path'), '/dashboard')
  assert.equal(safeInternalRedirect('//evil.example/path'), '/dashboard')
})

test('uses the requested fallback for invalid input', () => {
  assert.equal(safeInternalRedirect(null, '/login'), '/login')
  assert.equal(safeInternalRedirect('dashboard', '/login'), '/login')
})
