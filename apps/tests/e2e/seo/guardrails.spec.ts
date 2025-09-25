import { test, expect } from '@playwright/test'

test.describe('SEO Guardrails', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/auth/signin')
    await page.fill('input[name="email"]', 'admin@khaledaun.com')
    await page.fill('input[name="password"]', 'testpassword')
    await page.click('button[type="submit"]')
  })

  test('should validate title length and format', async ({ page }) => {
    await page.goto('/admin/posts/new')

    await test.step('Flag title too short', async () => {
      await page.fill('input[name="title"]', 'Short')
      await page.blur('input[name="title"]')
      
      // Should show warning
      await expect(page.locator('text=Title is too short')).toBeVisible()
      await expect(page.locator('text=Recommended: 30-60 characters')).toBeVisible()
    })

    await test.step('Flag title too long', async () => {
      const longTitle = 'This is an extremely long title that exceeds the recommended SEO length and will likely be truncated in search results which is not good for user experience'
      
      await page.fill('input[name="title"]', longTitle)
      await page.blur('input[name="title"]')
      
      // Should show warning
      await expect(page.locator('text=Title is too long')).toBeVisible()
      await expect(page.locator('text=Characters: 147/60')).toBeVisible()
    })

    await test.step('Validate optimal title', async () => {
      await page.fill('input[name="title"]', 'Complete Guide to Modern Web Development Practices')
      await page.blur('input[name="title"]')
      
      // Should show success indicator
      await expect(page.locator('text=Title length is optimal')).toBeVisible()
      await expect(page.locator('.text-green-600')).toBeVisible()
    })
  })

  test('should validate meta description', async ({ page }) => {
    await page.goto('/admin/posts/new')
    await page.click('text=SEO Settings')

    await test.step('Flag missing meta description', async () => {
      await page.fill('input[name="title"]', 'Test Post')
      // Leave meta description empty
      await page.blur('textarea[name="metaDescription"]')
      
      // Should show warning
      await expect(page.locator('text=Meta description is missing')).toBeVisible()
      await expect(page.locator('text=Recommended: 120-160 characters')).toBeVisible()
    })

    await test.step('Flag meta description too short', async () => {
      await page.fill('textarea[name="metaDescription"]', 'Too short desc')
      await page.blur('textarea[name="metaDescription"]')
      
      // Should show warning
      await expect(page.locator('text=Meta description is too short')).toBeVisible()
    })

    await test.step('Flag meta description too long', async () => {
      const longDesc = 'This is an extremely long meta description that exceeds the recommended length for search engine optimization and will likely be truncated in search results which defeats the purpose of having a compelling description that encourages users to click through to your website from search results.'
      
      await page.fill('textarea[name="metaDescription"]', longDesc)
      await page.blur('textarea[name="metaDescription"]')
      
      // Should show warning
      await expect(page.locator('text=Meta description is too long')).toBeVisible()
      await expect(page.locator('text=Characters: 290/160')).toBeVisible()
    })

    await test.step('Validate optimal meta description', async () => {
      const optimalDesc = 'Learn modern web development practices including React, TypeScript, and Next.js. Complete guide with examples and best practices.'
      
      await page.fill('textarea[name="metaDescription"]', optimalDesc)
      await page.blur('textarea[name="metaDescription"]')
      
      // Should show success indicator
      await expect(page.locator('text=Meta description is optimal')).toBeVisible()
    })
  })

  test('should validate URL slug format', async ({ page }) => {
    await page.goto('/admin/posts/new')

    await test.step('Auto-generate slug from title', async () => {
      await page.fill('input[name="title"]', 'Complete Guide to Modern Web Development')
      await page.blur('input[name="title"]')
      
      // Should auto-generate URL-friendly slug
      await expect(page.locator('input[name="slug"]')).toHaveValue('complete-guide-to-modern-web-development')
    })

    await test.step('Flag invalid slug characters', async () => {
      await page.fill('input[name="slug"]', 'invalid-slug-with-CAPS-and-symbols!')
      await page.blur('input[name="slug"]')
      
      // Should show warning
      await expect(page.locator('text=Slug contains invalid characters')).toBeVisible()
      await expect(page.locator('text=Use only lowercase letters, numbers, and hyphens')).toBeVisible()
    })

    await test.step('Check slug uniqueness', async () => {
      // Mock API response for duplicate slug
      await page.route('**/api/posts/check-slug', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ exists: true })
        })
      })

      await page.fill('input[name="slug"]', 'existing-post-slug')
      await page.blur('input[name="slug"]')
      
      // Should show uniqueness error
      await expect(page.locator('text=This slug is already in use')).toBeVisible()
      await expect(page.locator('button:has-text("Suggest Alternative")')).toBeVisible()
    })
  })

  test('should validate content structure and readability', async ({ page }) => {
    await page.goto('/admin/posts/new')

    await test.step('Check heading hierarchy', async () => {
      const content = `
        # Main Title
        ### H3 without H2 (bad structure)
        Some content here
        ## Proper H2
        ### Proper H3
      `
      
      await page.fill('textarea[name="content"]', content)
      await page.click('button:has-text("Check SEO")')
      
      // Should flag heading hierarchy issues
      await expect(page.locator('text=Heading hierarchy issue')).toBeVisible()
      await expect(page.locator('text=H3 used without preceding H2')).toBeVisible()
    })

    await test.step('Check content length', async () => {
      const shortContent = 'This is way too short for a blog post.'
      
      await page.fill('textarea[name="content"]', shortContent)
      await page.click('button:has-text("Check SEO")')
      
      // Should flag short content
      await expect(page.locator('text=Content is too short')).toBeVisible()
      await expect(page.locator('text=Recommended minimum: 300 words')).toBeVisible()
    })

    await test.step('Check keyword density', async () => {
      const content = `
        React development React best practices React tutorial React guide React tips React patterns React hooks React components React performance React optimization React testing React deployment React React React React React React React React React React
      `
      
      await page.fill('input[name="focusKeyword"]', 'React')
      await page.fill('textarea[name="content"]', content)
      await page.click('button:has-text("Check SEO")')
      
      // Should flag keyword stuffing
      await expect(page.locator('text=Keyword density too high')).toBeVisible()
      await expect(page.locator('text=Current: 45%, Recommended: 1-3%')).toBeVisible()
    })
  })

  test('should validate Open Graph and Twitter metadata', async ({ page }) => {
    await page.goto('/admin/posts/new')
    await page.click('text=Social Media')

    await test.step('Check Open Graph image dimensions', async () => {
      // Mock image upload with incorrect dimensions
      await page.route('**/api/media/upload', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            url: 'https://example.com/image.jpg',
            width: 600,
            height: 400,
            size: 50000
          })
        })
      })

      await page.click('button:has-text("Upload OG Image")')
      
      // Should show dimension warning
      await expect(page.locator('text=OG image dimensions not optimal')).toBeVisible()
      await expect(page.locator('text=Recommended: 1200x630px')).toBeVisible()
    })

    await test.step('Validate Twitter card data', async () => {
      await page.fill('input[name="twitterTitle"]', 'A')
      await page.blur('input[name="twitterTitle"]')
      
      // Should show Twitter-specific validation
      await expect(page.locator('text=Twitter title too short')).toBeVisible()
    })
  })

  test('should check internal and external links', async ({ page }) => {
    await page.goto('/admin/posts/new')

    await test.step('Validate internal links', async () => {
      const contentWithLinks = `
        Check out our [other post](/blog/nonexistent-post) for more details.
        Also see our [contact page](/contact) for support.
      `
      
      await page.fill('textarea[name="content"]', contentWithLinks)
      await page.click('button:has-text("Check Links")')
      
      // Should flag broken internal link
      await expect(page.locator('text=Broken internal link found')).toBeVisible()
      await expect(page.locator('text=/blog/nonexistent-post')).toBeVisible()
    })

    await test.step('Check external link attributes', async () => {
      const contentWithExternalLinks = `
        Visit [Google](https://google.com) for search.
        Check [Example](https://example.com) for examples.
      `
      
      await page.fill('textarea[name="content"]', contentWithExternalLinks)
      await page.click('button:has-text("Check Links")')
      
      // Should suggest rel attributes for external links
      await expect(page.locator('text=External links missing rel attributes')).toBeVisible()
      await expect(page.locator('text=Add rel="noopener" for security')).toBeVisible()
    })
  })

  test('should generate SEO score and recommendations', async ({ page }) => {
    await page.goto('/admin/posts/new')

    // Fill in content for SEO analysis
    await page.fill('input[name="title"]', 'Complete Guide to React Hooks for Beginners')
    await page.fill('input[name="focusKeyword"]', 'React hooks')
    
    await page.click('text=SEO Settings')
    await page.fill('textarea[name="metaDescription"]', 'Learn React hooks with practical examples. Complete guide covering useState, useEffect, and custom hooks for modern React development.')
    
    const content = `
      # Complete Guide to React Hooks for Beginners

      React hooks revolutionized how we write React components. In this comprehensive guide, we'll explore React hooks and learn how to use them effectively.

      ## What are React Hooks?

      React hooks are functions that let you use state and other React features in functional components. Before hooks, you needed class components to manage state.

      ## Common React Hooks

      ### useState Hook
      The useState hook is the most commonly used React hook for managing component state.

      ### useEffect Hook
      The useEffect hook lets you perform side effects in functional components.

      ## Best Practices for React Hooks

      When using React hooks, follow these best practices to write clean and efficient code.

      ## Conclusion

      React hooks make functional components more powerful and easier to understand. Start using React hooks in your next project!
    `
    
    await page.fill('textarea[name="content"]', content)
    await page.click('button:has-text("Analyze SEO")')

    // Should generate SEO score
    await expect(page.locator('text=SEO Score:')).toBeVisible()
    await expect(page.locator('.seo-score')).toBeVisible()

    // Should show recommendations
    await expect(page.locator('text=SEO Recommendations')).toBeVisible()
    
    // Should show positive indicators
    await expect(page.locator('text=✅ Title contains focus keyword')).toBeVisible()
    await expect(page.locator('text=✅ Meta description optimal length')).toBeVisible()
    await expect(page.locator('text=✅ Content has good heading structure')).toBeVisible()
    await expect(page.locator('text=✅ Content length is sufficient')).toBeVisible()

    // Should calculate readability score
    await expect(page.locator('text=Readability Score:')).toBeVisible()
  })

  test('should prevent publishing with SEO issues', async ({ page }) => {
    await page.goto('/admin/posts/new')

    // Create post with SEO issues
    await page.fill('input[name="title"]', 'Bad') // Too short
    await page.fill('textarea[name="content"]', 'Short content') // Too short
    // No meta description

    await page.click('button:has-text("Publish")')

    // Should block publishing
    await expect(page.locator('text=Cannot publish with SEO issues')).toBeVisible()
    await expect(page.locator('text=Fix the following issues:')).toBeVisible()
    await expect(page.locator('text=- Title too short')).toBeVisible()
    await expect(page.locator('text=- Missing meta description')).toBeVisible()
    await expect(page.locator('text=- Content too short')).toBeVisible()

    // Should offer draft save option
    await expect(page.locator('button:has-text("Save as Draft")')).toBeVisible()
  })

  test('should provide SEO-friendly URL suggestions', async ({ page }) => {
    await page.goto('/admin/posts/new')

    await test.step('Suggest URL optimization', async () => {
      await page.fill('input[name="title"]', 'How to Learn JavaScript: A Complete Beginner\'s Guide with Examples and Best Practices')
      await page.blur('input[name="title"]')

      // Should suggest shorter URL
      await expect(page.locator('text=Consider shorter URL')).toBeVisible()
      await expect(page.locator('button:has-text("Optimize URL")')).toBeVisible()

      await page.click('button:has-text("Optimize URL")')

      // Should provide optimized slug
      await expect(page.locator('input[name="slug"]')).toHaveValue('learn-javascript-beginners-guide')
    })
  })
})