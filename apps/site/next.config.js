/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  './src/i18n/request.js'
);

const nextConfig = {
  images: {
    domains: [
      'worldtme.com', 
      'www.lvj-visa.com', 
      'www.nas-law.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ]
  }
};

module.exports = withNextIntl(nextConfig);
