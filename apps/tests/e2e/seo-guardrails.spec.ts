import { test, expect } from '@playwright/test';

test('should load the SEO checks page', async ({ page }) => {
  await page.goto('/admin/seo-checks');
  await expect(page.getByRole('heading', { name: 'SEO Checks' })).toBeVisible();
});
