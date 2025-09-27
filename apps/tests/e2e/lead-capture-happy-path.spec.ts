import { test, expect } from '@playwright/test';
import { 
  mockLogin, 
  navigateToCommandCenter, 
  submitContactForm, 
  expectLeadInCommandCenter,
  TEST_DATA 
} from '../test-utils';

test.describe('Lead Capture Happy Path - Real-time Verification', () => {
  test('should capture lead and verify real-time updates in Command Center', async ({ page, context }) => {
    // Step 1: Login as admin and navigate to Command Center
    const admin = await mockLogin(page, 'admin');
    await navigateToCommandCenter(page);
    
    // Verify initial state - should show existing leads
    await expect(page.getByText('Lead Funnel')).toBeVisible();
    await expect(page.getByText('Total Leads')).toBeVisible();
    
    // Step 2: Create a new browser context to simulate a public user
    const publicContext = await context.browser()?.newContext();
    const publicPage = await publicContext?.newPage();
    
    if (!publicPage) {
      throw new Error('Failed to create public user page');
    }
    
    // Step 3: Submit contact form as public user
    await submitContactForm(publicPage, TEST_DATA.lead);
    
    // Step 4: Switch back to admin page and verify real-time update
    // Wait a moment for the real-time update to propagate
    await page.waitForTimeout(2000);
    
    // Refresh the Command Center to see the new lead
    await page.reload();
    await navigateToCommandCenter(page);
    
    // Step 5: Verify the new lead appears in the Lead Funnel
    await expectLeadInCommandCenter(page, TEST_DATA.lead.email);
    
    // Verify the lead count has increased
    const leadCountElement = page.locator('text=Total Leads').locator('..').locator('span').first();
    await expect(leadCountElement).toContainText('3'); // Should be 3 (2 existing + 1 new)
    
    // Step 6: Verify lead details in the UI
    const leadElement = page.locator(`text=${TEST_DATA.lead.email}`).locator('..');
    await expect(leadElement).toContainText(TEST_DATA.lead.name || TEST_DATA.lead.email);
    await expect(leadElement).toContainText('NEW'); // Should show NEW status
    
    // Clean up
    await publicContext?.close();
  });
  
  test('should handle multiple lead submissions', async ({ page, context }) => {
    // Login as admin
    await mockLogin(page, 'admin');
    await navigateToCommandCenter(page);
    
    // Get initial lead count
    const initialCountElement = page.locator('text=Total Leads').locator('..').locator('span').first();
    const initialCount = await initialCountElement.textContent();
    const initialCountNum = parseInt(initialCount || '0');
    
    // Submit multiple leads
    const leads = [
      { email: 'lead1@test.com', name: 'Lead One' },
      { email: 'lead2@test.com', name: 'Lead Two' },
      { email: 'lead3@test.com', name: 'Lead Three' }
    ];
    
    for (const lead of leads) {
      const publicContext = await context.browser()?.newContext();
      const publicPage = await publicContext?.newPage();
      
      if (publicPage) {
        await submitContactForm(publicPage, lead);
        await publicContext?.close();
        
        // Wait for real-time update
        await page.waitForTimeout(1000);
      }
    }
    
    // Refresh and verify all leads appear
    await page.reload();
    await navigateToCommandCenter(page);
    
    // Check final count
    const finalCountElement = page.locator('text=Total Leads').locator('..').locator('span').first();
    const finalCount = await finalCountElement.textContent();
    const finalCountNum = parseInt(finalCount || '0');
    
    expect(finalCountNum).toBe(initialCountNum + leads.length);
    
    // Verify each lead appears
    for (const lead of leads) {
      await expectLeadInCommandCenter(page, lead.email);
    }
  });
  
  test('should validate contact form submission', async ({ page }) => {
    // Test form validation
    await page.goto('/en/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    
    // Fill out form with invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('textarea[name="message"]', 'Test message');
    
    await page.click('button[type="submit"]');
    
    // Should show email validation error
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    
    // Fill out form correctly
    await page.fill('input[name="email"]', 'valid@test.com');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('textarea[name="message"]', 'Test message');
    
    await page.click('button[type="submit"]');
    
    // Should submit successfully
    await page.waitForTimeout(1000);
    // Form should be submitted (no validation errors visible)
    await expect(page.locator('input[name="email"]:invalid')).not.toBeVisible();
  });
});
