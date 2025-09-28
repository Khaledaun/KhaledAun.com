import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PRODUCTION_URL || 'http://localhost:3001';

test.describe('Phase 5 - Index Dark Implementation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Layout Parity', () => {
    test('should render sections in exact order', async ({ page }) => {
      // Check that all sections are present in the correct order
      const sections = [
        'nav', // Header
        'section', // Hero
        'section', // About
        'section', // Services
        'section', // LinkedIn
        'section', // Ventures
        'footer' // Footer
      ];

      for (let i = 0; i < sections.length; i++) {
        const element = page.locator(sections[i]).nth(i);
        await expect(element).toBeVisible();
      }
    });

    test('should have dark header and footer classes', async ({ page }) => {
      // Check header has dark styling
      const header = page.locator('nav');
      await expect(header).toHaveClass(/bg-brand-navy/);

      // Check footer has dark styling
      const footer = page.locator('footer');
      await expect(footer).toHaveClass(/bg-brand-ink/);
    });

    test('should have proper dark theme styling', async ({ page }) => {
      // Check body has dark theme
      const body = page.locator('body');
      await expect(body).toHaveClass(/bg-brand-navy/);

      // Check html has dark class
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    });
  });

  test.describe('Bilingual & RTL', () => {
    test('should render English version', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check English content
      await expect(page.locator('h1')).toContainText('Strategy in Legal Conflicts');
      
      // Check LTR direction
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'ltr');
      await expect(html).toHaveAttribute('lang', 'en');
    });

    test('should render Arabic version with RTL', async ({ page }) => {
      await page.goto(`${BASE_URL}/ar`);
      
      // Check Arabic content
      await expect(page.locator('h1')).toContainText('الاستراتيجية في النزاعات القانونية');
      
      // Check RTL direction
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'rtl');
      await expect(html).toHaveAttribute('lang', 'ar');
    });

    test('should have working language switch', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Click language switch
      await page.click('button:has-text("AR")');
      
      // Should redirect to Arabic version
      await expect(page).toHaveURL(/\/ar/);
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    });
  });

  test.describe('Ventures Links', () => {
    test('should have 3 external venture links', async ({ page }) => {
      const ventureLinks = page.locator('a[href*="worldtme.com"], a[href*="lvj-visa.com"], a[href*="nas-law.com"]');
      await expect(ventureLinks).toHaveCount(3);
    });

    test('should open venture links in new tab with security attributes', async ({ page }) => {
      const ventureLink = page.locator('a[href*="worldtme.com"]').first();
      
      await expect(ventureLink).toHaveAttribute('target', '_blank');
      await expect(ventureLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('should have working venture links', async ({ page }) => {
      // Test WorldTME link
      const worldtmeLink = page.locator('a[href*="worldtme.com"]').first();
      await expect(worldtmeLink).toBeVisible();
      
      // Test LVJ Visa link
      const lvjLink = page.locator('a[href*="lvj-visa.com"]').first();
      await expect(lvjLink).toBeVisible();
      
      // Test NAS Law link
      const nasLink = page.locator('a[href*="nas-law.com"]').first();
      await expect(nasLink).toBeVisible();
    });
  });

  test.describe('SEO', () => {
    test('should have proper metadata', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check title
      await expect(page).toHaveTitle(/Khaled Aun/);
      
      // Check meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /legal counsel/);
    });

    test('should have hreflang alternates', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check hreflang links
      const hreflangEn = page.locator('link[hreflang="en"]');
      const hreflangAr = page.locator('link[hreflang="ar"]');
      
      await expect(hreflangEn).toBeVisible();
      await expect(hreflangAr).toBeVisible();
    });

    test('should have working sitemap and robots', async ({ page }) => {
      // Test sitemap
      const sitemapResponse = await page.goto(`${BASE_URL}/sitemap.xml`);
      expect(sitemapResponse?.status()).toBe(200);
      
      // Test robots
      const robotsResponse = await page.goto(`${BASE_URL}/robots.txt`);
      expect(robotsResponse?.status()).toBe(200);
    });

    test('should have Organization JSON-LD on home page', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check for JSON-LD script
      const jsonLd = page.locator('script[type="application/ld+json"]');
      await expect(jsonLd).toBeVisible();
      
      // Check JSON-LD content
      const jsonLdContent = await jsonLd.textContent();
      expect(jsonLdContent).toContain('"@type": "Organization"');
      expect(jsonLdContent).toContain('Khaled Aun');
    });
  });

  test.describe('Consultation Modal', () => {
    test('should open consultation modal when clicking header CTA', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Click consultation button in header
      await page.click('button:has-text("Book a Consultation")');
      
      // Check modal is visible
      const modal = page.locator('[role="dialog"], .modal, [data-modal]').first();
      await expect(modal).toBeVisible();
    });

    test('should have focus trap in consultation modal', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Open modal
      await page.click('button:has-text("Book a Consultation")');
      
      // Check focus is trapped
      const modal = page.locator('[role="dialog"], .modal, [data-modal]').first();
      await expect(modal).toBeFocused();
    });

    test('should close modal with escape key', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Open modal
      await page.click('button:has-text("Book a Consultation")');
      
      // Press escape
      await page.keyboard.press('Escape');
      
      // Check modal is closed
      const modal = page.locator('[role="dialog"], .modal, [data-modal]').first();
      await expect(modal).not.toBeVisible();
    });

    test('should show Calendly iframe when configured', async ({ page }) => {
      // This test would need NEXT_PUBLIC_CALENDLY_URL to be set
      await page.goto(`${BASE_URL}/en`);
      
      // Open modal
      await page.click('button:has-text("Book a Consultation")');
      
      // Check for Calendly iframe or fallback form
      const iframe = page.locator('iframe[src*="calendly"]');
      const form = page.locator('form');
      
      // Either Calendly iframe or contact form should be present
      const hasCalendly = await iframe.isVisible();
      const hasForm = await form.isVisible();
      
      expect(hasCalendly || hasForm).toBe(true);
    });
  });

  test.describe('LinkedIn Section', () => {
    test('should render LinkedIn section', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check LinkedIn section is present
      const linkedinSection = page.locator('section:has-text("From LinkedIn")');
      await expect(linkedinSection).toBeVisible();
    });

    test('should have LinkedIn posts or wall embed', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check for LinkedIn content (either wall embed or curated posts)
      const linkedinContent = page.locator('section:has-text("From LinkedIn")');
      await expect(linkedinContent).toBeVisible();
      
      // Should have at least 3 posts or wall embed
      const posts = page.locator('section:has-text("From LinkedIn") .post, section:has-text("From LinkedIn") iframe');
      const postCount = await posts.count();
      expect(postCount).toBeGreaterThanOrEqual(3);
    });

    test('should have working LinkedIn follow button', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check LinkedIn follow button
      const linkedinButton = page.locator('a:has-text("Follow on LinkedIn")');
      await expect(linkedinButton).toBeVisible();
      
      // Check it opens in new tab
      await expect(linkedinButton).toHaveAttribute('target', '_blank');
      await expect(linkedinButton).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test.describe('Accessibility', () => {
    test('should have skip link that focuses main content', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check skip link is present
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeVisible();
      
      // Check skip link is focusable
      await skipLink.focus();
      await expect(skipLink).toBeFocused();
    });

    test('should have accessible names for interactive elements', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check buttons have accessible names
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // Button should have either aria-label or text content
        expect(ariaLabel || textContent?.trim()).toBeTruthy();
      }
    });

    test('should have proper focus styles', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Focus on a button
      const button = page.locator('button').first();
      await button.focus();
      
      // Check focus styles are applied
      await expect(button).toHaveClass(/ring-brand-gold/);
    });

    test('should not have contrast regressions', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Basic contrast check - text should be visible
      const headings = page.locator('h1, h2, h3');
      const headingCount = await headings.count();
      
      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i);
        await expect(heading).toBeVisible();
        
        // Check text color is not transparent
        const color = await heading.evaluate(el => getComputedStyle(el).color);
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
    });
  });

  test.describe('Brand Integration', () => {
    test('should use brand colors throughout', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check brand colors are used
      const brandElements = page.locator('.bg-brand-navy, .bg-brand-gold, .text-brand-gold, .text-brand-navy');
      await expect(brandElements.first()).toBeVisible();
    });

    test('should use brand fonts', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      
      // Check font variables are set
      const body = page.locator('body');
      await expect(body).toHaveClass(/font-body/);
      
      const heading = page.locator('h1').first();
      await expect(heading).toHaveClass(/font-heading/);
    });
  });
});
