/** @jest-environment node */

import { beforeEach, describe, expect, it, jest } from '@jest/globals'

const mockGenerateLink = jest.fn<(...args: unknown[]) => Promise<unknown>>()
const mockSendPasswordRecoveryEmail = jest.fn<(...args: unknown[]) => Promise<unknown>>()
const mockConsumeRateLimit = jest.fn<(...args: unknown[]) => Promise<unknown>>()
const mockSet = jest.fn<(...args: unknown[]) => Promise<unknown>>()
const mockDel = jest.fn<(...args: unknown[]) => Promise<unknown>>()

jest.mock('@/lib/email/password-recovery', () => ({ sendPasswordRecoveryEmail: mockSendPasswordRecoveryEmail }))
jest.mock('@/lib/rate-limit', () => ({ consumeRateLimit: mockConsumeRateLimit }))
jest.mock('@/lib/redis', () => ({ getRedis: () => ({ set: mockSet, del: mockDel }) }))
jest.mock('@/lib/supabase/env', () => ({
  requireSupabaseAdminConfig: () => ({ url: 'https://project.supabase.co', serviceRoleKey: 'service-role-key' }),
}))
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: { admin: { generateLink: mockGenerateLink } } }),
}))

function request(body: object, key?: string) {
  return new Request('https://cejoventut.com/api/auth/reset-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.1', ...(key ? { 'idempotency-key': key } : {}) },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/reset-password', () => {
  let post: (request: Request) => Promise<Response>

  beforeEach(async () => {
    jest.clearAllMocks()
    mockConsumeRateLimit.mockResolvedValue({ limited: false, remaining: 4 })
    mockGenerateLink.mockResolvedValue({ data: { properties: { hashed_token: 'hashed-token' } }, error: null })
    mockSendPasswordRecoveryEmail.mockResolvedValue('email-id')
    mockSet.mockResolvedValue('OK')
    mockDel.mockResolvedValue(1)
    ;({ POST: post } = await import('@/app/api/auth/reset-password/route'))
  })

  it('generates a recovery token and sends a first-party callback link', async () => {
    const response = await post(request({ email: 'USER@EXAMPLE.COM ' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(mockGenerateLink).toHaveBeenCalledWith({ type: 'recovery', email: 'user@example.com' })
    expect(mockSendPasswordRecoveryEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@example.com',
      resetUrl: 'https://cejoventut.com/auth/callback?token_hash=hashed-token&type=recovery',
      idempotencyKey: 'password-recovery:hashed-token',
    }))
  })

  it('returns a neutral success response for an unknown account', async () => {
    mockGenerateLink.mockResolvedValue({ data: { properties: {} }, error: { status: 404, message: 'User not found' } })

    const response = await post(request({ email: 'missing@example.com' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(mockSendPasswordRecoveryEmail).not.toHaveBeenCalled()
  })

  it('keeps the response neutral when the provider cannot deliver the email', async () => {
    mockSendPasswordRecoveryEmail.mockRejectedValueOnce(new Error('provider unavailable'))

    const response = await post(request({ email: 'user@example.com' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  it('releases the request key when delivery fails so the same request can retry', async () => {
    mockSendPasswordRecoveryEmail.mockRejectedValueOnce(new Error('provider unavailable'))
    const key = 'recovery-request-0002'
    expect((await post(request({ email: 'user@example.com' }, key))).status).toBe(200)
    expect(mockDel).toHaveBeenCalledTimes(1)
    expect((await post(request({ email: 'user@example.com' }, key))).status).toBe(200)
    expect(mockGenerateLink).toHaveBeenCalledTimes(2)
  })

  it('releases the request key after an unexpected Supabase failure', async () => {
    mockGenerateLink.mockRejectedValueOnce(new Error('Supabase unavailable'))
    const key = 'recovery-request-0003'
    expect((await post(request({ email: 'user@example.com' }, key))).status).toBe(500)
    expect(mockDel).toHaveBeenCalledTimes(1)
  })

  it('rejects malformed requests and rate limited requests', async () => {
    expect((await post(request({ email: 'invalid' }))).status).toBe(400)

    mockConsumeRateLimit.mockResolvedValueOnce({ limited: true, remaining: 0 })
    expect((await post(request({ email: 'user@example.com' }))).status).toBe(429)
    expect(mockGenerateLink).not.toHaveBeenCalled()
  })

  it('deduplicates before consuming rate limits so retries do not spend quota', async () => {
    mockSet.mockResolvedValueOnce('OK').mockResolvedValueOnce(null)
    const key = 'recovery-request-0001'
    expect((await post(request({ email: 'user@example.com' }, key))).status).toBe(200)
    expect((await post(request({ email: 'user@example.com' }, key))).status).toBe(200)
    expect(mockConsumeRateLimit).toHaveBeenCalledTimes(2)
    expect(mockConsumeRateLimit).toHaveBeenCalledWith(expect.stringContaining('password-reset:ip:'), 5, 3600)
    expect(mockGenerateLink).toHaveBeenCalledTimes(1)
  })

  it('still rate limits new keys even when callers provide idempotency keys', async () => {
    mockConsumeRateLimit.mockResolvedValueOnce({ limited: true, remaining: 0 })
    expect((await post(request({ email: 'user@example.com' }, 'recovery-request-0004'))).status).toBe(429)
    expect(mockGenerateLink).not.toHaveBeenCalled()
    expect(mockDel).not.toHaveBeenCalled()
  })

  it('rejects oversized streamed requests before invoking Supabase', async () => {
    const response = await post(request({ email: 'x'.repeat(3000) }))
    expect(response.status).toBe(413)
    expect(mockGenerateLink).not.toHaveBeenCalled()
  })
})
