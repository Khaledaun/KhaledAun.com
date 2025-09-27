import { Page, expect } from '@playwright/test';

// Test user credentials and tokens
export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'testpassword123',
    role: 'admin',
    token: 'mock-admin-jwt-token'
  },
  editor: {
    email: 'editor@test.com',
    password: 'testpassword123',
    role: 'editor',
    token: 'mock-editor-jwt-token'
  },
  ops: {
    email: 'ops@test.com',
    password: 'testpassword123',
    role: 'ops',
    token: 'mock-ops-jwt-token'
  }
};

// Test data for workflow testing
export const TEST_DATA = {
  admin: TEST_USERS.admin,
  editor: TEST_USERS.editor,
  ops: TEST_USERS.ops,
  post: {
    title: 'Test Post for E2E Testing',
    content: 'This is a test post created during E2E testing.',
    status: 'DRAFT',
    riskLevel: 'HIGH'
  },
  lead: {
    email: 'test-lead@example.com',
    name: 'Test Lead',
    source: 'e2e-test'
  },
  idea: {
    topics: ['E2E Testing', 'Automation'],
    locale: 'en'
  }
};

// Mock authentication helper
export async function mockLogin(page: Page, userType: 'admin' | 'editor' | 'ops') {
  const user = TEST_USERS[userType];
  
  // Set mock JWT token in localStorage
  await page.evaluate((token) => {
    localStorage.setItem('supabase.auth.token', token);
  }, user.token);
  
  // Set user role in localStorage for testing
  await page.evaluate((role) => {
    localStorage.setItem('user.role', role);
  }, user.role);
  
  return user;
}

// API request helper with authentication
export async function authenticatedRequest(page: Page, url: string, options: any = {}) {
  const user = TEST_USERS.admin; // Default to admin for API requests
  
  return page.request.fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

// Wait for real-time updates
export async function waitForRealtimeUpdate(page: Page, selector: string, timeout = 10000) {
  await page.waitForSelector(selector, { timeout });
}

// Create test data
export const TEST_DATA = {
  post: {
    title: 'Test Post for E2E Testing',
    content: 'This is a test post created during E2E testing.',
    status: 'DRAFT',
    riskLevel: 'HIGH'
  },
  lead: {
    email: 'test-lead@example.com',
    name: 'Test Lead',
    source: 'e2e-test'
  },
  idea: {
    topics: ['E2E Testing', 'Automation'],
    locale: 'en'
  }
};

// Navigation helpers
export async function navigateToCommandCenter(page: Page) {
  await page.goto('/admin/command-center');
  await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
}

export async function navigateToOutlineReview(page: Page) {
  await page.goto('/admin/hitl/outline-review');
  await expect(page.getByRole('heading', { name: 'Outline Review' })).toBeVisible();
}

export async function navigateToFactsReview(page: Page) {
  await page.goto('/admin/hitl/facts-review');
  await expect(page.getByRole('heading', { name: 'Facts Review' })).toBeVisible();
}

// Form submission helpers
export async function submitContactForm(page: Page, leadData: typeof TEST_DATA.lead) {
  await page.goto('/en/contact');
  await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
  
  // Fill out the contact form
  await page.fill('input[name="email"]', leadData.email);
  await page.fill('input[name="name"]', leadData.name);
  await page.fill('textarea[name="message"]', 'This is a test message from E2E testing.');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for success message or redirect
  await page.waitForTimeout(1000);
}

// Assertion helpers
export async function expectLeadInCommandCenter(page: Page, leadEmail: string) {
  await navigateToCommandCenter(page);
  
  // Check if the lead appears in the Lead Funnel section
  const leadElement = page.locator(`text=${leadEmail}`);
  await expect(leadElement).toBeVisible();
}

export async function expectPostStatusChange(page: Page, postId: string, expectedStatus: string) {
  // This would check the post status in the UI
  // For now, we'll just verify the API response
  const response = await authenticatedRequest(page, `/api/admin/posts/${postId}`);
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data.post.status).toBe(expectedStatus);
}
