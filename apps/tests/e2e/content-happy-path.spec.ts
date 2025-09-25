import { test, expect } from '@playwright/test';

test('should load the admin command center', async ({ page }) => {
  await page.goto('/admin/command-center');
  await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
});
