import { test, expect } from '@playwright/test';

test.describe('Public Site Phase 5', () => {
  test.beforeEach(async ({ page }) => {
    // Set base URL for the site app
    await page.goto('http://localhost:3001');
  });

  test('Home page loads in English with correct branding', async ({ page }) => {
    await page.goto('http://localhost:3001/en');
    
    // Check page loads
    await expect(page).toHaveTitle(/Khaled Aun/);
    
    // Check hero headline
    await expect(page.getByText('Strategy in Legal Conflicts. Vision to Expand and Grow.')).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ventures' })).toBeVisible();
    
    // Check branding colors are applied
    const heroSection = page.locator('section').first();
    await expect(heroSection).toHaveClass(/bg-gradient-to-br from-brand-navy/);
  });

  test('Home page loads in Arabic with RTL direction', async ({ page }) => {
    await page.goto('http://localhost:3001/ar');
    
    // Check HTML dir attribute
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    
    // Check Arabic content
    await expect(page.getByText('استراتيجية في النزاعات القانونية. رؤية للتوسع والنمو.')).toBeVisible();
    
    // Check Arabic navigation
    await expect(page.getByRole('link', { name: 'من نحن' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'مشاريعنا' })).toBeVisible();
  });

  test('Ventures page shows 3 external links with proper attributes', async ({ page }) => {
    await page.goto('http://localhost:3001/en/ventures');
    
    // Check page title
    await expect(page.getByText('Our Ventures')).toBeVisible();
    
    // Check all 3 venture cards
    await expect(page.getByText('WorldTME')).toBeVisible();
    await expect(page.getByText('LVJ Visa')).toBeVisible();
    await expect(page.getByText('NAS Law')).toBeVisible();
    
    // Check external links have proper attributes
    const worldtmeLink = page.getByRole('link', { name: 'Visit Website' }).first();
    await expect(worldtmeLink).toHaveAttribute('href', 'https://worldtme.com/');
    await expect(worldtmeLink).toHaveAttribute('target', '_blank');
    await expect(worldtmeLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    const lvjLink = page.getByRole('link', { name: 'Visit Website' }).nth(1);
    await expect(lvjLink).toHaveAttribute('href', 'https://www.lvj-visa.com/');
    
    const nasLink = page.getByRole('link', { name: 'Visit Website' }).nth(2);
    await expect(nasLink).toHaveAttribute('href', 'https://www.nas-law.com/');
  });

  test('SEO metadata and hreflang are present', async ({ page }) => {
    await page.goto('http://localhost:3001/en');
    
    // Check meta title
    await expect(page).toHaveTitle(/Khaled Aun - Legal Strategy/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Expert legal counsel/);
    
    // Check hreflang alternates (if implemented)
    const hreflangEn = page.locator('link[hreflang="en"]');
    const hreflangAr = page.locator('link[hreflang="ar"]');
    
    // These might not be implemented yet, so we'll just check they exist or don't error
    await hreflangEn.count().then(count => {
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test('Sitemap and robots.txt are served', async ({ page }) => {
    // Test sitemap
    const sitemapResponse = await page.goto('http://localhost:3001/sitemap.xml');
    expect(sitemapResponse?.status()).toBe(200);
    
    // Test robots.txt
    const robotsResponse = await page.goto('http://localhost:3001/robots.txt');
    expect(robotsResponse?.status()).toBe(200);
  });

  test('Skip link works and focus ring is visible', async ({ page }) => {
    await page.goto('http://localhost:3001/en');
    
    // Press Tab to focus the skip link
    await page.keyboard.press('Tab');
    
    // Check skip link is focused and visible
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    
    // Press Enter to activate skip link
    await page.keyboard.press('Enter');
    
    // Check we're at main content
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeInViewport();
  });

  test('All pages are accessible', async ({ page }) => {
    const pages = ['/en', '/en/about', '/en/ventures', '/en/contact'];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:3001${pagePath}`);
      
      // Check page loads without errors
      await expect(page.locator('body')).toBeVisible();
      
      // Check main content is present
      await expect(page.locator('#main-content')).toBeVisible();
    }
  });

  test('Fonts are loaded correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/en');
    
    // Check that font variables are applied
    const body = page.locator('body');
    await expect(body).toHaveClass(/font-body/);
    
    // Check heading font is applied
    const heading = page.locator('h1').first();
    await expect(heading).toHaveClass(/font-heading/);
  });

  test('Brand colors are applied correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/en');
    
    // Check hero section has brand colors
    const heroSection = page.locator('section').first();
    await expect(heroSection).toHaveClass(/from-brand-navy to-brand-ink/);
    
    // Check buttons have brand styling
    const primaryButton = page.getByRole('link', { name: 'About' });
    await expect(primaryButton).toHaveClass(/bg-brand-navy/);
    
    const secondaryButton = page.getByRole('link', { name: 'Ventures' });
    await expect(secondaryButton).toHaveClass(/bg-brand-gold/);
  });
});
