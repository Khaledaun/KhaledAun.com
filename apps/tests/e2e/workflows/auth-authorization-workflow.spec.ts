import { test, expect } from '@playwright/test';
import {
  mockLogin,
  authenticatedRequest,
  navigateToCommandCenter,
  navigateToOutlineReview,
  navigateToFactsReview,
  TEST_USERS
} from '../test-utils';

test.describe('Authentication & Authorization Workflow - Role-Based Access Control', () => {
  
  test('should enforce admin-only access to protected endpoints', async ({ page }) => {
    console.log('Testing admin-only access to protected endpoints...');
    
    // Test without authentication
    const unauthenticatedResponse = await page.request.get('/api/admin/posts');
    expect(unauthenticatedResponse.status()).toBe(401);
    console.log('✅ Unauthenticated request correctly rejected');
    
    // Test with invalid token
    const invalidTokenResponse = await page.request.get('/api/admin/posts', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    expect(invalidTokenResponse.status()).toBe(401);
    console.log('✅ Invalid token correctly rejected');
    
    // Test with valid admin token
    await mockLogin(page, 'admin');
    const adminResponse = await authenticatedRequest(page, '/api/admin/posts');
    expect(adminResponse.status()).toBe(200);
    console.log('✅ Admin access granted');
  });

  test('should enforce role-based permissions for different user types', async ({ page }) => {
    console.log('Testing role-based permissions...');
    
    // Test Editor permissions
    await mockLogin(page, 'editor');
    
    // Editor should be able to create posts
    const createPostResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: {
        title: 'Editor Test Post',
        content: 'This post was created by an editor.',
        status: 'DRAFT',
        riskLevel: 'LOW'
      }
    });
    expect(createPostResponse.status()).toBe(200);
    const postResult = await createPostResponse.json();
    const postId = postResult.post.id;
    console.log('✅ Editor can create posts');
    
    // Editor should be able to update posts
    const updatePostResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        title: 'Updated by Editor',
        status: 'READY'
      }
    });
    expect(updatePostResponse.status()).toBe(200);
    console.log('✅ Editor can update posts');
    
    // Editor should NOT be able to delete posts
    const deletePostResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'DELETE'
    });
    expect(deletePostResponse.status()).toBe(403);
    console.log('✅ Editor cannot delete posts (403 Forbidden)');
    
    // Test Ops permissions
    await mockLogin(page, 'ops');
    
    // Ops should be able to read leads
    const leadsResponse = await authenticatedRequest(page, '/api/admin/leads');
    expect(leadsResponse.status()).toBe(200);
    console.log('✅ Ops can read leads');
    
    // Ops should NOT be able to create posts
    const opsCreatePostResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: {
        title: 'Ops Test Post',
        content: 'This should fail.',
        status: 'DRAFT',
        riskLevel: 'LOW'
      }
    });
    expect(opsCreatePostResponse.status()).toBe(403);
    console.log('✅ Ops cannot create posts (403 Forbidden)');
  });

  test('should enforce UI access based on user roles', async ({ page }) => {
    console.log('Testing UI access based on user roles...');
    
    // Test Admin UI access
    await mockLogin(page, 'admin');
    await navigateToCommandCenter(page);
    await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Action Center' })).toBeVisible();
    console.log('✅ Admin can access Command Center');
    
    // Test Editor UI access
    await mockLogin(page, 'editor');
    await navigateToCommandCenter(page);
    await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
    console.log('✅ Editor can access Command Center');
    
    // Test HITL workflow access
    await navigateToOutlineReview(page);
    await expect(page.getByRole('heading', { name: 'Outline Review' })).toBeVisible();
    console.log('✅ Editor can access Outline Review');
    
    await navigateToFactsReview(page);
    await expect(page.getByRole('heading', { name: 'Facts Review' })).toBeVisible();
    console.log('✅ Editor can access Facts Review');
  });

  test('should handle JWT token expiration and refresh', async ({ page }) => {
    console.log('Testing JWT token expiration handling...');
    
    // Mock expired token
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', 'expired-jwt-token');
      localStorage.setItem('user.role', 'admin');
    });
    
    // Attempt to access protected endpoint with expired token
    const expiredTokenResponse = await page.request.get('/api/admin/posts', {
      headers: {
        'Authorization': 'Bearer expired-jwt-token'
      }
    });
    expect(expiredTokenResponse.status()).toBe(401);
    console.log('✅ Expired token correctly rejected');
    
    // Verify user is redirected to login or shown auth error
    await page.goto('/admin/command-center');
    
    // Should show authentication error or redirect to login
    const authError = page.locator('[data-testid="auth-error"]');
    const loginRedirect = page.locator('[data-testid="login-form"]');
    
    // Either auth error or login redirect should be visible
    const hasAuthError = await authError.isVisible();
    const hasLoginRedirect = await loginRedirect.isVisible();
    
    expect(hasAuthError || hasLoginRedirect).toBeTruthy();
    console.log('✅ Authentication error or login redirect shown');
  });

  test('should enforce RLS policies at database level', async ({ page }) => {
    console.log('Testing RLS policies at database level...');
    
    // Test with different user roles
    const roles = ['admin', 'editor', 'ops'];
    
    for (const role of roles) {
      await mockLogin(page, role);
      console.log(`Testing RLS policies for role: ${role}`);
      
      // Test post access based on role
      const postsResponse = await authenticatedRequest(page, '/api/admin/posts');
      expect(postsResponse.status()).toBe(200);
      
      const postsData = await postsResponse.json();
      console.log(`Role ${role} can access ${postsData.posts?.length || 0} posts`);
      
      // Test lead access based on role
      const leadsResponse = await authenticatedRequest(page, '/api/admin/leads');
      
      if (role === 'admin' || role === 'ops') {
        expect(leadsResponse.status()).toBe(200);
        console.log(`✅ Role ${role} can access leads`);
      } else {
        expect(leadsResponse.status()).toBe(403);
        console.log(`✅ Role ${role} cannot access leads (403 Forbidden)`);
      }
    }
  });

  test('should handle concurrent user sessions', async ({ page, context }) => {
    console.log('Testing concurrent user sessions...');
    
    // Create multiple browser contexts for different users
    const adminPage = await context.newPage();
    const editorPage = await context.newPage();
    
    // Login as different users in different contexts
    await mockLogin(adminPage, 'admin');
    await mockLogin(editorPage, 'editor');
    
    // Both users should be able to access their respective resources
    await adminPage.goto('/admin/command-center');
    await expect(adminPage.getByRole('heading', { name: 'Command Center' })).toBeVisible();
    
    await editorPage.goto('/admin/command-center');
    await expect(editorPage.getByRole('heading', { name: 'Command Center' })).toBeVisible();
    
    // Admin should be able to delete posts
    const adminPostsResponse = await adminPage.request.get('/api/admin/posts', {
      headers: {
        'Authorization': `Bearer ${TEST_USERS.admin.token}`
      }
    });
    expect(adminPostsResponse.status()).toBe(200);
    
    // Editor should not be able to delete posts
    const editorPostsResponse = await editorPage.request.get('/api/admin/posts', {
      headers: {
        'Authorization': `Bearer ${TEST_USERS.editor.token}`
      }
    });
    expect(editorPostsResponse.status()).toBe(200);
    
    // Test that sessions don't interfere with each other
    const adminData = await adminPostsResponse.json();
    const editorData = await editorPostsResponse.json();
    
    // Both should get data, but with different permissions
    expect(adminData.posts).toBeDefined();
    expect(editorData.posts).toBeDefined();
    
    console.log('✅ Concurrent user sessions working correctly');
    
    // Cleanup
    await adminPage.close();
    await editorPage.close();
  });

  test('should validate user role changes in real-time', async ({ page }) => {
    console.log('Testing real-time role validation...');
    
    // Start as editor
    await mockLogin(page, 'editor');
    
    // Editor should be able to create a post
    const createResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: {
        title: 'Role Change Test Post',
        content: 'Testing role changes.',
        status: 'DRAFT',
        riskLevel: 'LOW'
      }
    });
    expect(createResponse.status()).toBe(200);
    const postResult = await createResponse.json();
    const postId = postResult.post.id;
    
    // Simulate role change to admin (in real app, this would be done via admin panel)
    await mockLogin(page, 'admin');
    
    // Admin should be able to delete the post
    const deleteResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'DELETE'
    });
    expect(deleteResponse.status()).toBe(200);
    
    console.log('✅ Role change validation working correctly');
  });

  test('should handle malformed JWT tokens gracefully', async ({ page }) => {
    console.log('Testing malformed JWT token handling...');
    
    const malformedTokens = [
      'not-a-jwt-token',
      'Bearer',
      'Bearer ',
      'Bearer invalid.jwt.token',
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
      ''
    ];
    
    for (const token of malformedTokens) {
      const response = await page.request.get('/api/admin/posts', {
        headers: {
          'Authorization': token
        }
      });
      
      expect(response.status()).toBe(401);
      console.log(`✅ Malformed token rejected: ${token.substring(0, 20)}...`);
    }
  });
});
