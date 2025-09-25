import { test, expect } from '@playwright/test';

test.describe('API Smoke Tests', () => {
  test('should create a generation idea', async ({ request }) => {
    const response = await request.post('/api/ideas/generate', {
      data: { topics: ['Smoke Test'], locale: 'en' },
    });
    expect(response.ok()).toBeTruthy();
    const jsonResponse = await response.json();
    expect(jsonResponse.created).toBe(1);
  });

  test('should hit AI outline endpoints', async ({ request }) => {
    let response = await request.post('/api/ai/outline');
    expect(response.ok()).toBeTruthy();

    response = await request.post('/api/ai/outline/choose');
    expect(response.ok()).toBeTruthy();
  });

  test('should hit AI facts endpoints', async ({ request }) => {
    let response = await request.post('/api/ai/facts');
    expect(response.ok()).toBeTruthy();

    response = await request.post('/api/ai/facts/approve');
    expect(response.ok()).toBeTruthy();
  });
});
