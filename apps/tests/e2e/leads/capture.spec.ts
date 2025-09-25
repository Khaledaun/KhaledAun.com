import { test, expect } from '@playwright/test'

test.describe('Lead Capture', () => {
  test('should capture newsletter signup', async ({ page }) => {
    await page.goto('/')
    
    // Find newsletter signup form
    await expect(page.locator('input[name="email"]')).toBeVisible()
    
    // Fill in email
    await page.fill('input[name="email"]', 'test@example.com')
    await page.click('button:has-text("Subscribe")')
    
    // Should show success message
    await expect(page.locator('text=Thanks for subscribing')).toBeVisible()
    
    // Verify lead was captured (check admin panel)
    await page.goto('/admin/leads')
    await expect(page.locator('text=test@example.com')).toBeVisible()
  })

  test('should capture contact form submission', async ({ page }) => {
    await page.goto('/contact')
    
    // Fill contact form
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="company"]', 'Test Company')
    await page.fill('textarea[name="message"]', 'I am interested in your services')
    
    await page.click('button:has-text("Send Message")')
    
    // Should show success message
    await expect(page.locator('text=Message sent successfully')).toBeVisible()
    
    // Verify lead was captured with additional data
    await page.goto('/admin/leads')
    await page.click('text=john@example.com')
    
    // Check lead details
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=Test Company')).toBeVisible()
    await expect(page.locator('text=I am interested in your services')).toBeVisible()
  })

  test('should handle duplicate email submissions', async ({ page }) => {
    const email = 'duplicate@example.com'
    
    // First submission
    await page.goto('/')
    await page.fill('input[name="email"]', email)
    await page.click('button:has-text("Subscribe")')
    await expect(page.locator('text=Thanks for subscribing')).toBeVisible()
    
    // Second submission with same email
    await page.reload()
    await page.fill('input[name="email"]', email)
    await page.click('button:has-text("Subscribe")')
    
    // Should show appropriate message
    await expect(page.locator('text=You are already subscribed')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/')
    
    // Invalid email format
    await page.fill('input[name="email"]', 'invalid-email')
    await page.click('button:has-text("Subscribe")')
    
    // Should show validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
  })

  test('should track lead source', async ({ page }) => {
    // Test different lead sources
    const sources = [
      { path: '/?utm_source=google&utm_medium=cpc', expectedSource: 'google' },
      { path: '/?utm_source=facebook&utm_medium=social', expectedSource: 'facebook' },
      { path: '/blog/test-post', expectedSource: 'blog' },
    ]

    for (const source of sources) {
      await test.step(`Track lead from ${source.expectedSource}`, async () => {
        await page.goto(source.path)
        
        const email = `test-${source.expectedSource}@example.com`
        await page.fill('input[name="email"]', email)
        await page.click('button:has-text("Subscribe")')
        
        await expect(page.locator('text=Thanks for subscribing')).toBeVisible()
        
        // Verify source tracking in admin panel
        await page.goto('/admin/leads')
        await page.click(`text=${email}`)
        await expect(page.locator(`text=Source: ${source.expectedSource}`)).toBeVisible()
      })
    }
  })

  test('should handle lead qualification workflow', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/auth/signin')
    await page.fill('input[name="email"]', 'admin@khaledaun.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button[type="submit"]')

    // Go to leads management
    await page.goto('/admin/leads')
    
    // Find a new lead
    await page.click('text=NEW:first')
    
    // Qualify the lead
    await page.selectOption('select[name="status"]', 'QUALIFIED')
    await page.fill('textarea[name="notes"]', 'High-value prospect, follow up within 24 hours')
    await page.click('button:has-text("Update Lead")')
    
    // Should show success message
    await expect(page.locator('text=Lead updated successfully')).toBeVisible()
    
    // Verify status change
    await expect(page.locator('text=QUALIFIED')).toBeVisible()
  })

  test('should export leads data', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/auth/signin')
    await page.fill('input[name="email"]', 'admin@khaledaun.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button[type="submit"]')

    await page.goto('/admin/leads')
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download')
    
    // Click export button
    await page.click('button:has-text("Export Leads")')
    
    // Wait for download
    const download = await downloadPromise
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/leads-export-.+\.csv/)
  })

  test('should send automated lead notifications', async ({ page }) => {
    // Mock email service
    await page.route('**/api/email/send', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, messageId: 'test-123' })
      })
    })

    await page.goto('/contact')
    
    // Submit high-value lead (trigger notification)
    await page.fill('input[name="name"]', 'Enterprise Client')
    await page.fill('input[name="email"]', 'enterprise@bigcorp.com')
    await page.fill('input[name="company"]', 'Big Corporation')
    await page.fill('textarea[name="message"]', 'We need a comprehensive solution for 10,000+ users')
    
    await page.click('button:has-text("Send Message")')
    
    // Should trigger email notification (verify in admin panel)
    await page.goto('/admin/notifications')
    await expect(page.locator('text=New high-value lead: Enterprise Client')).toBeVisible()
  })
})