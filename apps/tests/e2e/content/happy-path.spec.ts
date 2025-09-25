import { test, expect } from '@playwright/test'

test.describe('Content Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login as admin user
    await page.goto('/auth/signin')
    // Mock auth or use test credentials
    await page.fill('input[name="email"]', 'admin@khaledaun.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin/command-center')
  })

  test('should complete content creation workflow', async ({ page }) => {
    // Step 1: Generate new idea
    await test.step('Generate new idea', async () => {
      await page.click('text=Generate New Idea')
      await page.fill('input[name="topic"]', 'Modern Web Development Practices')
      await page.selectOption('select[name="tone"]', 'professional')
      await page.selectOption('select[name="length"]', 'medium')
      await page.click('button:has-text("Generate Idea")')
      
      // Wait for success message
      await expect(page.locator('text=Idea generated successfully')).toBeVisible()
    })

    // Step 2: Review and approve outline
    await test.step('Review and approve outline', async () => {
      await page.click('text=Pending Reviews')
      await page.click('button:has-text("Review"):first')
      
      // Review modal should open
      await expect(page.locator('text=Review Outline')).toBeVisible()
      
      // Approve the outline
      await page.fill('textarea[name="feedback"]', 'Looks good, well structured')
      await page.click('button:has-text("Approve")')
      
      // Should see success message
      await expect(page.locator('text=Outline approved successfully')).toBeVisible()
    })

    // Step 3: Generate facts
    await test.step('Generate facts', async () => {
      await page.goto('/admin/ai/facts')
      await page.fill('input[name="topic"]', 'Modern Web Development Practices')
      await page.fill('input[name="factCount"]', '10')
      await page.click('button:has-text("Generate Facts")')
      
      await expect(page.locator('text=Facts generated successfully')).toBeVisible()
    })

    // Step 4: Review and approve facts
    await test.step('Review and approve facts', async () => {
      await page.click('text=Review Facts')
      
      // Facts review modal should open
      await expect(page.locator('text=Review Facts')).toBeVisible()
      
      // Select some facts to approve (first 5)
      for (let i = 0; i < 5; i++) {
        await page.click(`input[type="checkbox"]:nth-child(${i + 1})`)
      }
      
      await page.fill('textarea[name="feedback"]', 'Selected the most relevant facts')
      await page.click('button:has-text("Submit Review")')
      
      await expect(page.locator('text=facts approved successfully')).toBeVisible()
    })

    // Step 5: Create content
    await test.step('Create content', async () => {
      await page.goto('/admin/posts/new')
      await page.fill('input[name="title"]', 'Modern Web Development Practices')
      await page.fill('textarea[name="content"]', 'This is a comprehensive guide to modern web development...')
      await page.click('button:has-text("Save Draft")')
      
      await expect(page.locator('text=Draft saved successfully')).toBeVisible()
    })

    // Step 6: Publish content
    await test.step('Publish content', async () => {
      await page.click('button:has-text("Publish")')
      await page.click('button:has-text("Confirm Publish")')
      
      await expect(page.locator('text=Post published successfully')).toBeVisible()
    })
  })

  test('should handle content workflow failures gracefully', async ({ page }) => {
    // Test error handling in content workflow
    await test.step('Handle AI generation failure', async () => {
      // Mock API failure
      await page.route('**/api/ideas/generate', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'AI service unavailable' })
        })
      })

      await page.click('text=Generate New Idea')
      await page.fill('input[name="topic"]', 'Test Topic')
      await page.click('button:has-text("Generate Idea")')
      
      // Should show error message
      await expect(page.locator('text=Failed to generate idea')).toBeVisible()
    })
  })

  test('should validate content quality guardrails', async ({ page }) => {
    await test.step('Validate minimum content length', async () => {
      await page.goto('/admin/posts/new')
      await page.fill('input[name="title"]', 'Short Post')
      await page.fill('textarea[name="content"]', 'Too short')
      await page.click('button:has-text("Publish")')
      
      // Should show validation error
      await expect(page.locator('text=Content must be at least 300 words')).toBeVisible()
    })

    await test.step('Validate SEO requirements', async () => {
      await page.goto('/admin/posts/new')
      await page.fill('input[name="title"]', 'A Very Long Title That Exceeds The Recommended SEO Length For Better Search Engine Optimization')
      await page.click('button:has-text("Save Draft")')
      
      // Should show SEO warning
      await expect(page.locator('text=Title is too long for optimal SEO')).toBeVisible()
    })
  })
})