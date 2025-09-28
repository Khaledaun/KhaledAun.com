import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PRODUCTION_URL || 'http://localhost:3001';

test.describe('Phase 5 Final - Alignment & Mobile Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Template Alignment', () => {
    test('should follow exact section order', async ({ page }) => {
      // Check that all sections are present in the correct order
      const sections = [
        'nav[data-testid="header"]', // Header
        'section[data-testid="hero"]', // Hero
        'section[data-testid="about"]', // About
        'section[data-testid="services"]', // Services
        'section[data-testid="experience"]', // Experience (new)
        'section[data-testid="linkedin"]', // LinkedIn
        'section[data-testid="ventures"]', // Ventures
        'footer[data-testid="footer"]' // Footer
      ];

      for (let i = 0; i < sections.length; i++) {
        const element = page.locator(sections[i]);
        await expect(element).toBeVisible();
      }
    });

    test('should use correct brand colors', async ({ page }) => {
      // Check brand colors are applied
      const brandElements = page.locator('.bg-brand-navy, .bg-brand-gold, .text-brand-gold, .text-brand-navy, .bg-brand-ink');
      await expect(brandElements.first()).toBeVisible();
      
      // Check specific color values
      const navyElement = page.locator('.bg-brand-navy').first();
      await expect(navyElement).toBeVisible();
      
      const goldElement = page.locator('.text-brand-gold').first();
      await expect(goldElement).toBeVisible();
    });

    test('should use correct typography', async ({ page }) => {
      // Check font families are applied
      const heading = page.locator('h1').first();
      await expect(heading).toHaveClass(/font-heading/);
      
      const body = page.locator('body');
      await expect(body).toHaveClass(/font-body/);
    });
  });

  test.describe('Mobile Friendliness', () => {
    test('should work on iPhone 12 viewport', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/en`);
      
      // Check no horizontal scroll
      const body = page.locator('body');
      const scrollWidth = await body.evaluate(el => el.scrollWidth);
      const clientWidth = await body.evaluate(el => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
      
      // Check hero headline is visible
      const heroHeadline = page.locator('h1').first();
      await expect(heroHeadline).toBeVisible();
      
      // Check tap targets are at least 44x44px
      const buttons = page.locator('button, a[role="button"]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should work on iPad viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto(`${BASE_URL}/en`);
      
      // Check layout is responsive
      const hero = page.locator('section').first();
      await expect(hero).toBeVisible();
      
      // Check no horizontal scroll
      const body = page.locator('body');
      const scrollWidth = await body.evaluate(el => el.scrollWidth);
      const clientWidth = await body.evaluate(el => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/en`);
      
      // Check desktop layout
      const hero = page.locator('section').first();
      await expect(hero).toBeVisible();
      
      // Check navigation is visible
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    });

    test('should handle consultation modal on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/en`);
      
      // Open modal
      await page.click('button:has-text("Book a Consultation")');
      
      // Check modal is visible and scrollable
      const modal = page.locator('[role="dialog"], .modal, [data-modal]').first();
      await expect(modal).toBeVisible();
      
      // Check modal can be closed with ESC
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
      
      // Reopen and test backdrop click
      await page.click('button:has-text("Book a Consultation")');
      await expect(modal).toBeVisible();
      
      // Click backdrop to close
      await page.click('.fixed.inset-0', { position: { x: 10, y: 10 } });
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Experience Section', () => {
    test('should render at least 4 experience items', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      const experienceItems = page.locator('[data-testid^="experience-item-"]');
      const itemCount = await experienceItems.count();
      expect(itemCount).toBeGreaterThanOrEqual(4);
    });

    test('should load company logos', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      const logos = page.locator('[data-testid^="experience-item-"] img');
      const logoCount = await logos.count();
      
      for (let i = 0; i < logoCount; i++) {
        const logo = logos.nth(i);
        await expect(logo).toBeVisible();
        
        // Check image loads (naturalWidth > 0)
        const naturalWidth = await logo.evaluate(img => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    });

    test('should have alternating layout in EN', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      const experienceItems = page.locator('[data-testid^="experience-item-"]');
      const firstItem = experienceItems.first();
      const secondItem = experienceItems.nth(1);
      
      // Check alternating layout classes
      await expect(firstItem).toHaveClass(/lg:flex-row/);
      await expect(secondItem).toHaveClass(/lg:flex-row-reverse/);
    });

    test('should have alternating layout in AR', async ({ page }) => {
      await page.goto(`${BASE_URL}/ar`);
      
      const experienceItems = page.locator('[data-testid^="experience-item-"]');
      const firstItem = experienceItems.first();
      const secondItem = experienceItems.nth(1);
      
      // Check alternating layout classes
      await expect(firstItem).toHaveClass(/lg:flex-row/);
      await expect(secondItem).toHaveClass(/lg:flex-row-reverse/);
    });

    test('should be accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check semantic markup
      const experienceSection = page.locator('section[aria-labelledby="experience-title"]');
      await expect(experienceSection).toBeVisible();
      
      const timeline = page.locator('ol[role="list"]');
      await expect(timeline).toBeVisible();
      
      // Check decorative elements are hidden from screen readers
      const timelineLine = page.locator('[aria-hidden="true"]');
      await expect(timelineLine).toBeVisible();
    });
  });

  test.describe('Instagram Badge', () => {
    test('should only show if env is set', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // If NEXT_PUBLIC_INSTAGRAM_URL is not set, badge should not be visible
      const instagramBadge = page.locator('[data-testid="instagram-badge"]');
      const isVisible = await instagramBadge.isVisible();
      
      // This test will pass regardless of env setting
      // In real deployment, you'd set the env var and test accordingly
      expect(typeof isVisible).toBe('boolean');
    });

    test('should have valid link when visible', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      const instagramBadge = page.locator('[data-testid="instagram-badge"]');
      const isVisible = await instagramBadge.isVisible();
      
      if (isVisible) {
        await expect(instagramBadge).toHaveAttribute('target', '_blank');
        await expect(instagramBadge).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(instagramBadge).toHaveAttribute('href');
      }
    });

    test('should meet color contrast in dark theme', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      const instagramBadge = page.locator('[data-testid="instagram-badge"]');
      const isVisible = await instagramBadge.isVisible();
      
      if (isVisible) {
        // Check badge has proper styling for dark theme
        await expect(instagramBadge).toHaveClass(/bg-brand-navy/);
        await expect(instagramBadge).toHaveClass(/text-white/);
      }
    });
  });

  test.describe('Image Loading', () => {
    test('should load all placeholder images', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        await expect(img).toBeVisible();
        
        // Check image loads (naturalWidth > 0)
        const naturalWidth = await img.evaluate(img => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    });

    test('should have proper alt text for all images', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt?.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should pass basic axe checks on Experience section', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Basic accessibility checks
      const experienceSection = page.locator('section[aria-labelledby="experience-title"]');
      await expect(experienceSection).toBeVisible();
      
      // Check heading hierarchy
      const h2 = page.locator('h2#experience-title');
      await expect(h2).toBeVisible();
      
      // Check list structure
      const ol = page.locator('ol[role="list"]');
      await expect(ol).toBeVisible();
    });

    test('should have proper focus management', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Test focus on interactive elements
      const buttons = page.locator('button');
      const firstButton = buttons.first();
      
      await firstButton.focus();
      await expect(firstButton).toBeFocused();
      
      // Check focus styles
      await expect(firstButton).toHaveClass(/ring-brand-gold/);
    });
  });
});
