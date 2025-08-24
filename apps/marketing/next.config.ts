import type { NextConfig } from "next"

const config: NextConfig = {
  experimental: { externalDir: true },
  transpilePackages: ["@cej/ui", "@cej/i18n"]
}

export default config
