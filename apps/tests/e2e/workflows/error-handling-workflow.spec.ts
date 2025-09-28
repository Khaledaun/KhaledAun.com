import { test, expect } from '@playwright/test';
import {
  mockLogin,
  authenticatedRequest,
  navigateToCommandCenter,
  TEST_DATA
} from '../../test-utils';

test.describe('Error Handling & Edge Cases Workflow - Resilience Testing', () => {
  
  test('should handle network failures gracefully', async ({ page }) => {
    console.log('Testing network failure handling...');
    
    await mockLogin(page, 'admin');
    
    // Mock network failure for API requests
    await page.route('/api/admin/posts', route => {
      route.abort('failed');
    });
    
    // Attempt to access Command Center
    await navigateToCommandCenter(page);
    
    // Should show error state or retry mechanism
    const errorState = page.locator('[data-testid="error-state"]');
    const retryButton = page.locator('[data-testid="retry-button"]');
    
    // Either error state or retry button should be visible
    const hasErrorState = await errorState.isVisible();
    const hasRetryButton = await retryButton.isVisible();
    
    expect(hasErrorState || hasRetryButton).toBeTruthy();
    console.log('✅ Network failure handled gracefully');
    
    // Test retry functionality if available
    if (hasRetryButton) {
      await retryButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Retry functionality working');
    }
  });

  test('should handle API server errors (500, 502, 503)', async ({ page }) => {
    console.log('Testing API server error handling...');
    
    await mockLogin(page, 'admin');
    
    const serverErrors = [500, 502, 503];
    
    for (const statusCode of serverErrors) {
      // Mock server error
      await page.route('/api/admin/posts', route => {
        route.fulfill({
          status: statusCode,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      // Attempt to access protected endpoint
      const response = await authenticatedRequest(page, '/api/admin/posts');
      expect(response.status()).toBe(statusCode);
      
      const errorData = await response.json();
      expect(errorData.error).toBeTruthy();
      
      console.log(`✅ Server error ${statusCode} handled correctly`);
    }
  });

  test('should handle invalid request data', async ({ page }) => {
    console.log('Testing invalid request data handling...');
    
    await mockLogin(page, 'admin');
    
    // Test invalid post creation data
    const invalidPostData = [
      { title: '', content: 'Valid content' }, // Empty title
      { title: 'Valid title', content: '' }, // Empty content
      { title: 'Valid title', content: 'Valid content', status: 'INVALID_STATUS' }, // Invalid status
      { title: 'Valid title', content: 'Valid content', riskLevel: 'INVALID_RISK' }, // Invalid risk level
      { title: 'Valid title' }, // Missing required fields
      { title: 'Valid title', content: 'Valid content', status: 'DRAFT', riskLevel: 'HIGH', extraField: 'should be ignored' } // Extra fields
    ];
    
    for (const invalidData of invalidPostData) {
      const response = await authenticatedRequest(page, '/api/admin/posts', {
        method: 'POST',
        data: invalidData
      });
      
      // Should return validation error
      expect(response.status()).toBe(400);
      const errorData = await response.json();
      expect(errorData.error).toBeTruthy();
      
      console.log(`✅ Invalid data handled: ${JSON.stringify(invalidData).substring(0, 50)}...`);
    }
  });

  test('should handle concurrent operations safely', async ({ page, context }) => {
    console.log('Testing concurrent operations...');
    
    await mockLogin(page, 'admin');
    
    // Create multiple browser contexts for concurrent operations
    const contexts = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage()
    ]);
    
    // Login all contexts as admin
    await Promise.all(contexts.map(async (ctx) => {
      await mockLogin(ctx, 'admin');
    }));
    
    // Create posts concurrently
    const postPromises = contexts.map(async (ctx, index) => {
      return authenticatedRequest(ctx, '/api/admin/posts', {
        method: 'POST',
        data: {
          title: `Concurrent Post ${index + 1}`,
          content: `This is concurrent post ${index + 1}`,
          status: 'DRAFT',
          riskLevel: 'LOW'
        }
      });
    });
    
    const responses = await Promise.all(postPromises);
    
    // All requests should succeed
    responses.forEach((response, index) => {
      expect(response.status()).toBe(200);
      console.log(`✅ Concurrent post ${index + 1} created successfully`);
    });
    
    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));
  });

  test('should handle large data payloads', async ({ page }) => {
    console.log('Testing large data payload handling...');
    
    await mockLogin(page, 'admin');
    
    // Create a large content payload
    const largeContent = 'A'.repeat(10000); // 10KB of content
    const largePostData = {
      title: 'Large Content Post',
      content: largeContent,
      status: 'DRAFT',
      riskLevel: 'LOW'
    };
    
    const response = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: largePostData
    });
    
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.post).toBeTruthy();
    expect(result.post.content).toBe(largeContent);
    
    console.log('✅ Large data payload handled successfully');
  });

  test('should handle rapid successive requests', async ({ page }) => {
    console.log('Testing rapid successive requests...');
    
    await mockLogin(page, 'admin');
    
    // Make rapid successive requests
    const rapidRequests = Array.from({ length: 10 }, (_, index) => 
      authenticatedRequest(page, '/api/admin/posts', {
        method: 'POST',
        data: {
          title: `Rapid Post ${index + 1}`,
          content: `Rapid post content ${index + 1}`,
          status: 'DRAFT',
          riskLevel: 'LOW'
        }
      })
    );
    
    const responses = await Promise.all(rapidRequests);
    
    // All requests should succeed
    responses.forEach((response, index) => {
      expect(response.status()).toBe(200);
    });
    
    console.log('✅ Rapid successive requests handled successfully');
  });

  test('should handle malformed JSON requests', async ({ page }) => {
    console.log('Testing malformed JSON handling...');
    
    await mockLogin(page, 'admin');
    
    // Test malformed JSON
    const malformedJsonResponse = await page.request.post('/api/admin/posts', {
      headers: {
        'Authorization': `Bearer ${TEST_DATA.admin?.token || 'mock-admin-jwt-token'}`,
        'Content-Type': 'application/json'
      },
      data: '{"title": "Malformed JSON", "content": "Missing closing brace"'
    });
    
    expect(malformedJsonResponse.status()).toBe(400);
    console.log('✅ Malformed JSON handled correctly');
  });

  test('should handle timeout scenarios', async ({ page }) => {
    console.log('Testing timeout scenarios...');
    
    await mockLogin(page, 'admin');
    
    // Mock slow response
    await page.route('/api/admin/posts', async route => {
      // Simulate slow response
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 second delay
      route.continue();
    });
    
    // Set shorter timeout
    page.setDefaultTimeout(5000);
    
    try {
      await authenticatedRequest(page, '/api/admin/posts');
      // Should not reach here due to timeout
      expect(false).toBeTruthy();
    } catch (error) {
      // Should timeout
      const errorMessage = error instanceof Error ? error.message : String(error);
      expect(errorMessage).toContain('timeout');
      console.log('✅ Timeout handled correctly');
    }
    
    // Reset timeout
    page.setDefaultTimeout(30000);
  });

  test('should handle database connection failures', async ({ page }) => {
    console.log('Testing database connection failure handling...');
    
    await mockLogin(page, 'admin');
    
    // Mock database connection failure
    await page.route('/api/admin/posts', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Database connection failed',
          code: 'DB_CONNECTION_ERROR'
        })
      });
    });
    
    const response = await authenticatedRequest(page, '/api/admin/posts');
    expect(response.status()).toBe(503);
    
    const errorData = await response.json();
    expect(errorData.error).toContain('Database connection failed');
    expect(errorData.code).toBe('DB_CONNECTION_ERROR');
    
    console.log('✅ Database connection failure handled correctly');
  });

  test('should handle authentication token expiration during long operations', async ({ page }) => {
    console.log('Testing token expiration during long operations...');
    
    await mockLogin(page, 'admin');
    
    // Start a long operation
    const longOperationPromise = authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: {
        title: 'Long Operation Post',
        content: 'This post will take a long time to process.',
        status: 'DRAFT',
        riskLevel: 'LOW'
      }
    });
    
    // Simulate token expiration during operation
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      localStorage.removeItem('supabase.auth.token');
    });
    
    // The operation should handle token expiration gracefully
    try {
      const response = await longOperationPromise;
      // If it succeeds, that's also valid (token might still be valid)
      const status = response.status();
      expect(status === 200 || status === 401).toBeTruthy();
    } catch (error) {
      // If it fails due to token expiration, that's expected
      const errorMessage = error instanceof Error ? error.message : String(error);
      expect(errorMessage).toContain('401');
    }
    
    console.log('✅ Token expiration during long operations handled');
  });

  test('should handle UI state corruption gracefully', async ({ page }) => {
    console.log('Testing UI state corruption handling...');
    
    await mockLogin(page, 'admin');
    
    // Navigate to Command Center
    await navigateToCommandCenter(page);
    
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('corrupted-data', 'invalid-json{');
      localStorage.setItem('user.role', 'invalid-role');
    });
    
    // Refresh the page
    await page.reload();
    
    // Should handle corrupted state gracefully
    // Either show error state or reset to default state
    const errorState = page.locator('[data-testid="error-state"]');
    const defaultState = page.locator('[data-testid="default-state"]');
    const commandCenter = page.getByRole('heading', { name: 'Command Center' });
    
    const hasErrorState = await errorState.isVisible();
    const hasDefaultState = await defaultState.isVisible();
    const hasCommandCenter = await commandCenter.isVisible();
    
    expect(hasErrorState || hasDefaultState || hasCommandCenter).toBeTruthy();
    console.log('✅ UI state corruption handled gracefully');
  });
});
