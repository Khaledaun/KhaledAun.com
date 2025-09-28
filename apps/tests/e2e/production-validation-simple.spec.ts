import { test, expect } from '@playwright/test';

/**
 * Simple Production Validation E2E Tests
 * 
 * These tests validate production deployment readiness without requiring
 * a running server. They focus on configuration and static validation.
 */

test.describe('Production Readiness Tests', () => {
  test('should have valid middleware configuration', async () => {
    console.log('🔧 Validating middleware configuration...');
    
    // This test validates that middleware.ts exists and has proper exports
    // In a real scenario, this would be done through static analysis
    
    const fs = require('fs');
    const path = require('path');
    
    const middlewarePath = path.join(process.cwd(), 'apps/admin/middleware.ts');
    const middlewareExists = fs.existsSync(middlewarePath);
    
    expect(middlewareExists).toBe(true);
    console.log('✅ Middleware file exists');
    
    if (middlewareExists) {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
      
      // Check for security headers configuration
      expect(middlewareContent).toContain('SECURITY_HEADERS');
      expect(middlewareContent).toContain('X-Frame-Options');
      expect(middlewareContent).toContain('X-Content-Type-Options');
      expect(middlewareContent).toContain('Strict-Transport-Security');
      console.log('✅ Security headers configuration found');
      
      // Check for CORS configuration
      expect(middlewareContent).toContain('ALLOWED_ORIGINS');
      expect(middlewareContent).toContain('Access-Control-Allow-Origin');
      console.log('✅ CORS configuration found');
      
      // Check for rate limiting
      expect(middlewareContent).toContain('RATE_LIMIT');
      expect(middlewareContent).toContain('rateLimitStore');
      console.log('✅ Rate limiting configuration found');
    }
  });

  test('should have health endpoint configured', async () => {
    console.log('🏥 Validating health endpoint configuration...');
    
    const fs = require('fs');
    const path = require('path');
    
    const healthPath = path.join(process.cwd(), 'apps/admin/app/api/health/route.ts');
    const healthExists = fs.existsSync(healthPath);
    
    expect(healthExists).toBe(true);
    console.log('✅ Health endpoint file exists');
    
    if (healthExists) {
      const healthContent = fs.readFileSync(healthPath, 'utf8');
      
      // Check for proper health endpoint structure
      expect(healthContent).toContain('export async function GET');
      expect(healthContent).toContain('status: \'healthy\'');
      expect(healthContent).toContain('timestamp');
      expect(healthContent).toContain('responseTime');
      console.log('✅ Health endpoint has proper structure');
      
      // Check for database connectivity testing
      expect(healthContent).toContain('database');
      expect(healthContent).toContain('supabase');
      console.log('✅ Health endpoint includes database connectivity check');
    }
  });

  test('should have production-ready package.json', async () => {
    console.log('📦 Validating package.json configuration...');
    
    const fs = require('fs');
    const path = require('path');
    
    const packagePath = path.join(process.cwd(), 'apps/admin/package.json');
    const packageExists = fs.existsSync(packagePath);
    
    expect(packageExists).toBe(true);
    console.log('✅ Package.json exists');
    
    if (packageExists) {
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      let packageJson;
      
      // Validate JSON syntax
      try {
        packageJson = JSON.parse(packageContent);
        console.log('✅ Package.json has valid JSON syntax');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Package.json has invalid JSON: ${errorMessage}`);
      }
      
      // Check for required scripts
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      console.log('✅ Required scripts are configured');
      
      // Check for required dependencies
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies.next).toBeDefined();
      expect(packageJson.dependencies.react).toBeDefined();
      console.log('✅ Core dependencies are configured');
      
      // Check for Sentry integration
      if (packageJson.dependencies['@sentry/nextjs']) {
        console.log('✅ Sentry integration configured');
      }
      
      // Check for Supabase integration
      if (packageJson.dependencies['@supabase/supabase-js']) {
        console.log('✅ Supabase integration configured');
      }
    }
  });

  test('should have next.config.js configured', async () => {
    console.log('⚙️  Validating Next.js configuration...');
    
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(process.cwd(), 'apps/admin/next.config.js');
    const configExists = fs.existsSync(configPath);
    
    expect(configExists).toBe(true);
    console.log('✅ next.config.js exists');
    
    if (configExists) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      // Check for proper module export
      expect(configContent).toContain('module.exports');
      console.log('✅ Next.js config has proper export');
      
      // Check for security headers configuration
      if (configContent.includes('headers()')) {
        expect(configContent).toContain('X-Frame-Options');
        expect(configContent).toContain('X-Content-Type-Options');
        console.log('✅ Additional security headers configured in Next.js');
      }
    }
  });

  test('should have environment variable documentation', async () => {
    console.log('🌍 Validating environment variable documentation...');
    
    const fs = require('fs');
    const path = require('path');
    
    const envExamplePath = path.join(process.cwd(), 'env.production.example');
    const envExampleExists = fs.existsSync(envExamplePath);
    
    expect(envExampleExists).toBe(true);
    console.log('✅ Environment example file exists');
    
    if (envExampleExists) {
      const envContent = fs.readFileSync(envExamplePath, 'utf8');
      
      // Check for required environment variables
      expect(envContent).toContain('NEXT_PUBLIC_SUPABASE_URL');
      expect(envContent).toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(envContent).toContain('RATE_LIMIT_MAX');
      expect(envContent).toContain('ALLOWED_ORIGINS');
      console.log('✅ Required environment variables documented');
      
      // Check for security configuration
      expect(envContent).toContain('NEXTAUTH_SECRET');
      console.log('✅ Security configuration documented');
    }
  });

  test('should have deployment documentation', async () => {
    console.log('📚 Validating deployment documentation...');
    
    const fs = require('fs');
    const path = require('path');
    
    const deploymentPath = path.join(process.cwd(), 'docs/DEPLOYMENT_VALIDATION_CHECKLIST.md');
    const deploymentExists = fs.existsSync(deploymentPath);
    
    expect(deploymentExists).toBe(true);
    console.log('✅ Deployment validation checklist exists');
    
    if (deploymentExists) {
      const deploymentContent = fs.readFileSync(deploymentPath, 'utf8');
      
      // Check for key sections
      expect(deploymentContent).toContain('Security Headers');
      expect(deploymentContent).toContain('CORS');
      expect(deploymentContent).toContain('Rate Limiting');
      expect(deploymentContent).toContain('Health');
      console.log('✅ Key validation sections documented');
    }
    
    const readmePath = path.join(process.cwd(), 'README.md');
    const readmeExists = fs.existsSync(readmePath);
    
    expect(readmeExists).toBe(true);
    console.log('✅ README.md exists');
  });

  test('should have Playwright test configuration', async () => {
    console.log('🎭 Validating Playwright test configuration...');
    
    const fs = require('fs');
    const path = require('path');
    
    const playwrightConfigPath = path.join(process.cwd(), 'playwright.config.ts');
    const playwrightExists = fs.existsSync(playwrightConfigPath);
    
    expect(playwrightExists).toBe(true);
    console.log('✅ Playwright config exists');
    
    if (playwrightExists) {
      const playwrightContent = fs.readFileSync(playwrightConfigPath, 'utf8');
      
      // Check for proper test configuration
      expect(playwrightContent).toContain('testDir');
      expect(playwrightContent).toContain('baseURL');
      console.log('✅ Playwright properly configured');
      
      // Check for web server configuration
      if (playwrightContent.includes('webServer')) {
        console.log('✅ Web server configuration found for E2E tests');
      }
    }
    
    // Check for test files
    const testDir = path.join(process.cwd(), 'apps/tests/e2e');
    const testDirExists = fs.existsSync(testDir);
    
    expect(testDirExists).toBe(true);
    console.log('✅ E2E test directory exists');
  });
});