import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: { ppr: false },
  transpilePackages: ['@cej/ui'],
  allowedDevOrigins: ['http://192.168.1.49:3001'] // tu IP local
}

export default config
