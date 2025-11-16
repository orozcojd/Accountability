/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['d123456.cloudfront.net'],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable experimental features for App Router
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
