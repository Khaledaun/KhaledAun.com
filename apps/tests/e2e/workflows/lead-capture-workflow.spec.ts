import { test, expect } from '@playwright/test';
import {
  mockLogin,
  navigateToCommandCenter,
  submitContactForm,
  expectLeadInCommandCenter,
  TEST_DATA,
  TEST_USERS
} from '../../test-utils';

test.describe('Lead Capture Workflow - Real-time Lead Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login as admin for lead management
    await mockLogin(page, 'admin');
  });

  test('should capture lead and verify real-time updates in Command Center', async ({ page, context }) => {
    // Step 1: Navigate to Command Center as admin
    console.log('Step 1: Admin accessing Command Center...');
    await navigateToCommandCenter(page);
    
    // Verify initial state
    await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Action Center' })).toBeVisible();
    
    // Get initial lead count
    const initialLeadCount = await page.locator('[data-testid="lead-count"]').textContent();
    console.log(`Initial lead count: ${initialLeadCount}`);

    // Step 2: Simulate public user submitting contact form
    console.log('Step 2: Simulating public user contact form submission...');
    
    // Create a new page context for the public user
    const publicPage = await context.newPage();
    
    // Generate unique test data
    const timestamp = Date.now();
    const testLead = {
      email: `test-lead-${timestamp}@example.com`,
      name: `Test Lead ${timestamp}`,
      message: 'This is a test message from E2E lead capture workflow.'
    };
    
    // Submit contact form as public user
    await publicPage.goto('/en/contact');
    await expect(publicPage.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    
    // Fill out the contact form
    await publicPage.fill('input[name="email"]', testLead.email);
    await publicPage.fill('input[name="name"]', testLead.name);
    await publicPage.fill('textarea[name="message"]', testLead.message);
    
    // Submit the form
    await publicPage.click('button[type="submit"]');
    
    // Wait for form submission to complete
    await publicPage.waitForTimeout(2000);
    console.log(`Contact form submitted for: ${testLead.email}`);

    // Step 3: Verify lead appears in real-time in Command Center
    console.log('Step 3: Verifying real-time lead capture...');
    
    // Wait for real-time update (up to 10 seconds)
    await page.waitForTimeout(3000);
    
    // Refresh the Command Center to see the new lead
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
    
    // Check if the new lead appears in the Lead Funnel
    const leadElement = page.locator(`[data-testid="lead-${testLead.email}"]`);
    await expect(leadElement).toBeVisible({ timeout: 10000 });
    
    // Verify lead details
    await expect(leadElement.locator('[data-testid="lead-name"]')).toHaveText(testLead.name);
    await expect(leadElement.locator('[data-testid="lead-email"]')).toHaveText(testLead.email);
    await expect(leadElement.locator('[data-testid="lead-status"]')).toHaveText('NEW');
    
    console.log('✅ Lead captured and verified in real-time');

    // Step 4: Verify lead count updated
    console.log('Step 4: Verifying lead count update...');
    const updatedLeadCount = await page.locator('[data-testid="lead-count"]').textContent();
    expect(parseInt(updatedLeadCount || '0')).toBeGreaterThan(parseInt(initialLeadCount || '0'));
    console.log(`Updated lead count: ${updatedLeadCount}`);

    // Step 5: Test lead status update
    console.log('Step 5: Testing lead status update...');
    
    // Click on the lead to open details or update status
    await leadElement.click();
    
    // Update lead status to CONTACTED
    await page.click('[data-testid="update-lead-status-btn"]');
    await page.selectOption('[data-testid="status-select"]', 'CONTACTED');
    await page.click('[data-testid="save-lead-status-btn"]');
    
    // Verify status update
    await expect(leadElement.locator('[data-testid="lead-status"]')).toHaveText('CONTACTED');
    console.log('✅ Lead status updated successfully');

    // Step 6: Verify lead in Action Center
    console.log('Step 6: Verifying lead in Action Center...');
    
    // Check if the lead appears in Action Center as a new item
    const actionItem = page.locator(`[data-testid="action-item-lead-${testLead.email}"]`);
    await expect(actionItem).toBeVisible();
    await expect(actionItem.locator('[data-testid="action-description"]')).toContainText('New lead');
    
    console.log('✅ Lead verified in Action Center');

    // Cleanup: Close the public user page
    await publicPage.close();
    
    console.log('✅ Lead capture workflow completed successfully!');
  });

  test('should handle multiple lead submissions', async ({ page, context }) => {
    console.log('Testing multiple lead submissions...');
    
    // Navigate to Command Center
    await navigateToCommandCenter(page);
    
    // Get initial lead count
    const initialCount = await page.locator('[data-testid="lead-count"]').textContent();
    const initialLeadCount = parseInt(initialCount || '0');
    
    // Submit multiple leads
    const numberOfLeads = 3;
    const testLeads = [];
    
    for (let i = 0; i < numberOfLeads; i++) {
      const timestamp = Date.now() + i;
      const testLead = {
        email: `multi-lead-${timestamp}@example.com`,
        name: `Multi Lead ${timestamp}`,
        message: `Test message ${i + 1} from multiple lead submission test.`
      };
      
      testLeads.push(testLead);
      
      // Create new page for each lead submission
      const leadPage = await context.newPage();
      
      await leadPage.goto('/en/contact');
      await leadPage.fill('input[name="email"]', testLead.email);
      await leadPage.fill('input[name="name"]', testLead.name);
      await leadPage.fill('textarea[name="message"]', testLead.message);
      await leadPage.click('button[type="submit"]');
      
      await leadPage.waitForTimeout(1000);
      await leadPage.close();
      
      console.log(`Submitted lead ${i + 1}: ${testLead.email}`);
    }
    
    // Wait for all leads to be processed
    await page.waitForTimeout(5000);
    
    // Refresh Command Center
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
    
    // Verify all leads appear
    for (const lead of testLeads) {
      const leadElement = page.locator(`[data-testid="lead-${lead.email}"]`);
      await expect(leadElement).toBeVisible({ timeout: 10000 });
      console.log(`Verified lead: ${lead.email}`);
    }
    
    // Verify lead count increased
    const finalCount = await page.locator('[data-testid="lead-count"]').textContent();
    const finalLeadCount = parseInt(finalCount || '0');
    expect(finalLeadCount).toBe(initialLeadCount + numberOfLeads);
    
    console.log(`✅ Multiple leads verified. Count: ${initialLeadCount} → ${finalLeadCount}`);
  });

  test('should validate contact form submission', async ({ page }) => {
    console.log('Testing contact form validation...');
    
    // Test invalid email
    await page.goto('/en/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    
    // Submit form with invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('textarea[name="message"]', 'Test message');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
    
    // Test empty required fields
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="name"]', '');
    await page.fill('textarea[name="message"]', '');
    await page.click('button[type="submit"]');
    
    // Should show multiple validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-error"]')).toBeVisible();
    
    // Test valid submission
    await page.fill('input[name="email"]', 'valid@example.com');
    await page.fill('input[name="name"]', 'Valid User');
    await page.fill('textarea[name="message"]', 'Valid message');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Thank you');
    
    console.log('✅ Contact form validation working correctly');
  });

  test('should handle lead capture errors gracefully', async ({ page }) => {
    console.log('Testing lead capture error handling...');
    
    // Mock API failure by intercepting the request
    await page.route('/api/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('/en/contact');
    
    // Submit valid form
    await page.fill('input[name="email"]', 'error-test@example.com');
    await page.fill('input[name="name"]', 'Error Test User');
    await page.fill('textarea[name="message"]', 'This should cause an error');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('error');
    
    console.log('✅ Error handling working correctly');
  });
});
