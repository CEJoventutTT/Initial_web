/// <reference types="jest" />

import { consumeRateLimit } from '@/lib/rate-limit'
import { getRedis } from '@/lib/redis'

jest.mock('@/lib/redis', () => ({ getRedis: jest.fn() }))

describe('consumeRateLimit', () => {
  const incr = jest.fn()
  const expire = jest.fn()

  beforeEach(() => {
    jest.mocked(getRedis).mockReturnValue({ incr, expire } as never)
    incr.mockReset()
    expire.mockReset()
    expire.mockResolvedValue(1)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('starts the window on the first request and reports remaining requests', async () => {
    incr.mockResolvedValue(1)

    await expect(consumeRateLimit('rate-limit:join:hash', 5, 3600)).resolves.toEqual({
      limited: false,
      remaining: 4,
    })

    expect(incr).toHaveBeenCalledWith('rate-limit:join:hash')
    expect(expire).toHaveBeenCalledWith('rate-limit:join:hash', 3600)
  })

  it('does not extend an existing window and blocks requests above the limit', async () => {
    incr.mockResolvedValue(6)

    await expect(consumeRateLimit('rate-limit:join:hash', 5, 3600)).resolves.toEqual({
      limited: true,
      remaining: 0,
    })

    expect(expire).not.toHaveBeenCalled()
  })

  it('fails closed when Redis is not configured', async () => {
    jest.mocked(getRedis).mockReturnValue(null)

    await expect(consumeRateLimit('rate-limit:join:hash', 5, 3600)).rejects.toThrow(
      'Redis rate limiting is not configured',
    )
  })
})
