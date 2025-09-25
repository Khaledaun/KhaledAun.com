import { test, expect } from '@playwright/test';

test('should find the action center on the dashboard', async ({ page }) => {
  await page.goto('/admin/command-center');
  await expect(page.getByRole('heading', { name: 'Action Center' })).toBeVisible();
});
