/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CEJTT_SUPABASE_URL:
      process.env.NEXT_PUBLIC_CEJTT_SUPABASE_URL || process.env.CEJTT_SUPABASE_URL,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
