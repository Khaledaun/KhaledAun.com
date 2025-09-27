import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for comprehensive workflow testing
 * This configuration is optimized for testing complete user journeys
 * and complex multi-step workflows.
 */
export default defineConfig({
  testDir: './workflows',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report-workflows' }],
    ['json', { outputFile: 'test-results-workflows.json' }],
    ['junit', { outputFile: 'test-results-workflows.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium-workflows',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-workflows',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-workflows',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'cd ../../admin && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  expect: {
    timeout: 10000,
  },
  timeout: 60 * 1000, // 60 seconds for workflow tests
});
