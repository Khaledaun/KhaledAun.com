import { test, expect } from '@playwright/test';

test('should load the contact page', async ({ page }) => {
  await page.goto('/en/contact');
  await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
});
