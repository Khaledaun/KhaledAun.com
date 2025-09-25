/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable experimental features for better monorepo support
    transpilePackages: ['@khaledaun/ai', '@khaledaun/db', '@khaledaun/worker']
  },
  // Configure webpack to properly resolve workspace packages
  webpack: (config) => {
    config.resolve.symlinks = false
    return config
  }
}

module.exports = nextConfig