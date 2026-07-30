/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CEJTT_SUPABASE_URL:
      process.env.NEXT_PUBLIC_CEJTT_SUPABASE_URL || process.env.CEJTT_SUPABASE_URL,
    NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.CEJTT_SUPABASE_PUBLISHABLE_KEY,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
