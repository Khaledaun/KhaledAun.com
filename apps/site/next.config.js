/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')();

const nextConfig = {
  images: {
    domains: [
      'worldtme.com', 
      'www.lvj-visa.com', 
      'www.nas-law.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ]
  },
  // Ensure middleware runs on Edge Runtime
  experimental: {
    serverActions: true
  }
};

module.exports = withNextIntl(nextConfig);
