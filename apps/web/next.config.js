/** @type {import('next').NextConfig} */
const nextConfig = {
  // transpilePackages moved out of experimental in Next.js 14
  transpilePackages: ['@khaledaun/ai', '@khaledaun/db', '@khaledaun/worker'],
  // Configure webpack to properly resolve workspace packages
  webpack: (config) => {
    config.resolve.symlinks = false
    return config
  }
}

module.exports = nextConfig