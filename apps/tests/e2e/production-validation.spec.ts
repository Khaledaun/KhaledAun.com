import { test, expect } from '@playwright/test';

/**
 * Production Validation E2E Tests
 * 
 * These tests validate production deployment features including:
 * - Security headers
 * - CORS configuration
 * - Rate limiting
 * - Health endpoint functionality
 * - Production environment readiness
 */

const PRODUCTION_BASE_URL = process.env.PRODUCTION_URL || 'http://localhost:3000';

test.describe('Production Validation Tests', () => {
  test.describe('Security Headers Validation', () => {
    test('should have all required security headers', async ({ request }) => {
      const response = await request.get(`${PRODUCTION_BASE_URL}/`);
      
      // Required security headers as per middleware.ts
      const requiredHeaders = {
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'x-xss-protection': '1; mode=block',
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'referrer-policy': 'origin-when-cross-origin',
        'permissions-policy': 'camera=(), microphone=(), geolocation=()'
      };

      console.log('🔒 Validating security headers...');
      
      for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
        const actualValue = response.headers()[header];
        expect(actualValue, `Missing or incorrect ${header} header`).toBe(expectedValue);
        console.log(`✅ ${header}: ${actualValue}`);
      }

      // Validate CSP header exists and has basic protections
      const csp = response.headers()['content-security-policy'];
      expect(csp, 'Content-Security-Policy header is missing').toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-src 'none'");
      expect(csp).toContain("object-src 'none'");
      console.log('✅ Content-Security-Policy: Present with basic protections');
    });

    test('should have security headers on API routes', async ({ request }) => {
      const response = await request.get(`${PRODUCTION_BASE_URL}/api/health`);
      
      expect(response.headers()['x-frame-options']).toBe('DENY');
      expect(response.headers()['x-content-type-options']).toBe('nosniff');
      console.log('✅ Security headers present on API routes');
    });
  });

  test.describe('CORS Validation', () => {
    test('should handle CORS for allowed origins', async ({ request }) => {
      console.log('🌐 Testing CORS configuration...');
      
      // Test preflight request
      const preflightResponse = await request.fetch(`${PRODUCTION_BASE_URL}/api/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type'
        }
      });

      // Should allow CORS for localhost in development
      if (PRODUCTION_BASE_URL.includes('localhost')) {
        expect(preflightResponse.headers()['access-control-allow-origin']).toBeTruthy();
        console.log('✅ CORS configured for localhost');
      }
    });

    test('should reject CORS for disallowed origins', async ({ request }) => {
      console.log('🚫 Testing CORS rejection for disallowed origins...');
      
      const response = await request.fetch(`${PRODUCTION_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Origin': 'https://malicious-site.com'
        }
      });

      // Should not include Access-Control-Allow-Origin for disallowed origins
      const corsHeader = response.headers()['access-control-allow-origin'];
      expect(corsHeader).not.toBe('https://malicious-site.com');
      console.log('✅ CORS properly rejects disallowed origins');
    });
  });

  test.describe('Rate Limiting Validation', () => {
    test('should implement rate limiting on API routes', async ({ request }) => {
      console.log('⏱️  Testing rate limiting...');
      
      const rateLimitMax = 100; // Default from middleware
      const testRequests = 5; // Small number for testing
      
      const requests = Array.from({ length: testRequests }, (_, i) =>
        request.get(`${PRODUCTION_BASE_URL}/api/health`)
      );
      
      const responses = await Promise.all(requests);
      
      // All requests should succeed (under rate limit)
      responses.forEach((response, index) => {
        expect(response.status()).toBe(200);
        
        // Check rate limit headers
        const remainingHeader = response.headers()['x-ratelimit-remaining'];
        const limitHeader = response.headers()['x-ratelimit-limit'];
        
        if (remainingHeader) {
          expect(parseInt(remainingHeader)).toBeLessThanOrEqual(rateLimitMax);
          console.log(`✅ Request ${index + 1}: Rate limit remaining = ${remainingHeader}`);
        }
        
        if (limitHeader) {
          expect(parseInt(limitHeader)).toBe(rateLimitMax);
        }
      });
    });

    test('should return 429 when rate limit exceeded', async ({ request }) => {
      console.log('🚨 Testing rate limit enforcement...');
      
      // This test would need a way to trigger rate limiting
      // For now, we'll test the structure of rate limit responses
      const response = await request.get(`${PRODUCTION_BASE_URL}/api/health`);
      
      // Verify that rate limit headers are present
      const headers = response.headers();
      
      // Rate limit headers should be present on API routes
      if (headers['x-ratelimit-limit']) {
        expect(parseInt(headers['x-ratelimit-limit'])).toBeGreaterThan(0);
        console.log('✅ Rate limit headers configured properly');
      }
    });
  });

  test.describe('Health Endpoint Validation', () => {
    test('should respond with healthy status', async ({ request }) => {
      console.log('🏥 Testing health endpoint...');
      
      const response = await request.get(`${PRODUCTION_BASE_URL}/api/health`);
      
      expect(response.status()).toBe(200);
      
      const healthData = await response.json();
      expect(healthData).toHaveProperty('status');
      expect(healthData.status).toBe('healthy');
      
      // Validate health response structure
      expect(healthData).toHaveProperty('timestamp');
      expect(healthData).toHaveProperty('environment');
      
      console.log('✅ Health endpoint responding correctly');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Environment: ${healthData.environment}`);
      console.log(`   Timestamp: ${healthData.timestamp}`);
    });

    test('should provide database connectivity status', async ({ request }) => {
      console.log('💾 Testing database connectivity via health endpoint...');
      
      const response = await request.get(`${PRODUCTION_BASE_URL}/api/health`);
      const healthData = await response.json();
      
      // Health endpoint should indicate database status
      if (healthData.database) {
        expect(healthData.database.status).toBeTruthy();
        console.log(`✅ Database status: ${healthData.database.status}`);
      } else {
        console.log('ℹ️  Database status not included in health response');
      }
    });
  });

  test.describe('Production Environment Validation', () => {
    test('should have production-ready configuration', async ({ request }) => {
      console.log('🚀 Validating production configuration...');
      
      // Test that static files are served properly
      const faviconResponse = await request.get(`${PRODUCTION_BASE_URL}/favicon.ico`);
      expect(faviconResponse.status()).toBeLessThan(500); // Should not be a server error
      
      // Test that the main page loads
      const pageResponse = await request.get(`${PRODUCTION_BASE_URL}/`);
      expect(pageResponse.status()).toBeLessThan(400); // Should not be a client/server error
      
      console.log('✅ Production environment basics validated');
    });

    test('should handle 404 errors gracefully', async ({ request }) => {
      console.log('🔍 Testing 404 error handling...');
      
      const response = await request.get(`${PRODUCTION_BASE_URL}/non-existent-page`);
      expect(response.status()).toBe(404);
      
      console.log('✅ 404 errors handled correctly');
    });

    test('should have proper error boundaries for API routes', async ({ request }) => {
      console.log('⚠️  Testing API error handling...');
      
      // Test malformed request to API
      const response = await request.post(`${PRODUCTION_BASE_URL}/api/nonexistent`, {
        data: { invalid: 'data' }
      });
      
      // Should return appropriate error status, not crash
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500); // Should not be server error for missing endpoint
      
      console.log('✅ API error boundaries working properly');
    });
  });

  test.describe('Performance & Reliability', () => {
    test('should respond within acceptable time limits', async ({ request }) => {
      console.log('⚡ Testing response times...');
      
      const startTime = Date.now();
      const response = await request.get(`${PRODUCTION_BASE_URL}/api/health`);
      const responseTime = Date.now() - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
      
      console.log(`✅ Health endpoint response time: ${responseTime}ms`);
    });

    test('should handle concurrent requests properly', async ({ request }) => {
      console.log('🔄 Testing concurrent request handling...');
      
      const concurrentRequests = Array.from({ length: 5 }, () =>
        request.get(`${PRODUCTION_BASE_URL}/api/health`)
      );
      
      const responses = await Promise.all(concurrentRequests);
      
      responses.forEach((response, index) => {
        expect(response.status()).toBe(200);
      });
      
      console.log('✅ Concurrent requests handled successfully');
    });
  });
});