#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing static i18n configuration...\n');

// Import config
const configPath = path.join(__dirname, '../src/i18n/config.js');
let config;
try {
  config = require(configPath);
  console.log('✅ i18n config loaded successfully');
  console.log(`   Locales: ${config.locales.join(', ')}`);
  console.log(`   Default locale: ${config.defaultLocale}`);
} catch (error) {
  console.error('❌ Failed to load i18n config:', error.message);
  process.exit(1);
}

// Test message files
console.log('\n📄 Testing message files...');
const messagesDir = path.join(__dirname, '../src/messages');

for (const locale of config.locales) {
  const messagePath = path.join(messagesDir, `${locale}.json`);
  try {
    const messages = JSON.parse(fs.readFileSync(messagePath, 'utf8'));
    console.log(`✅ ${locale}.json loaded successfully (${Object.keys(messages).length} namespaces)`);
  } catch (error) {
    console.error(`❌ Failed to load ${locale}.json:`, error.message);
    process.exit(1);
  }
}

// Test static generation compatibility
console.log('\n🏗️  Testing static generation compatibility...');
const buildDir = path.join(__dirname, '../.next');

if (fs.existsSync(buildDir)) {
  // Check if static pages are generated for each locale
  const staticDir = path.join(buildDir, 'static');
  const serverDir = path.join(buildDir, 'server');
  
  console.log('✅ Build directory exists');
  
  // Check for locale-specific static files
  for (const locale of config.locales) {
    const localePages = [
      `server/app/${locale}/(site)/page.js`,
      `server/app/${locale}/(site)/about/page.js`,
      `server/app/${locale}/(site)/contact/page.js`,
      `server/app/${locale}/(site)/ventures/page.js`
    ];
    
    for (const pagePath of localePages) {
      const fullPath = path.join(buildDir, pagePath);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ Static page generated: ${locale}/${pagePath.split('/').pop().replace('.js', '')}`);
      } else {
        console.log(`⚠️  Static page missing: ${locale}/${pagePath.split('/').pop().replace('.js', '')}`);
      }
    }
  }
} else {
  console.log('⚠️  Build directory not found. Run `npm run build` first.');
}

console.log('\n🎉 i18n test completed!');