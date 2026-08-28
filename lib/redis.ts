import 'server-only'

import { Redis } from '@upstash/redis'

function getRedisConfig() {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
  }
}

export function getRedis() {
  const { url, token } = getRedisConfig()
  if (!url || !token) return null

  return new Redis({ url, token })
}
