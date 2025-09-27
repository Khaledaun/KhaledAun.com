import { test, expect } from '@playwright/test';
import { 
  mockLogin, 
  navigateToOutlineReview, 
  navigateToFactsReview, 
  authenticatedRequest,
  TEST_DATA 
} from '../test-utils';

test.describe('Content Happy Path - Full Authenticated Workflow', () => {
  test('should complete full content creation workflow as editor', async ({ page }) => {
    // Step 1: Login as editor
    const editor = await mockLogin(page, 'editor');
    
    // Step 2: Create a new idea
    const ideaResponse = await authenticatedRequest(page, '/api/ideas/generate', {
      method: 'POST',
      data: TEST_DATA.idea
    });
    expect(ideaResponse.status()).toBe(200);
    const ideaData = await ideaResponse.json();
    expect(ideaData.created).toBe(1);
    
    // Step 3: Navigate to outline review and approve outline
    await navigateToOutlineReview(page);
    
    // Wait for outline options to load
    await page.waitForSelector('[data-testid="outline-option"]', { timeout: 5000 });
    
    // Select the first outline option
    const firstOption = page.locator('[data-testid="outline-option"]').first();
    await firstOption.click();
    
    // Approve the outline
    await page.click('button:has-text("Approve Outline")');
    
    // Wait for approval confirmation
    await page.waitForSelector('text=Outline approved successfully!', { timeout: 5000 });
    
    // Step 4: Navigate to facts review and approve facts
    await navigateToFactsReview(page);
    
    // Wait for facts to load
    await page.waitForSelector('[data-testid="fact-item"]', { timeout: 5000 });
    
    // Select all facts for approval
    const factCheckboxes = page.locator('[data-testid="fact-item"] input[type="checkbox"]');
    const count = await factCheckboxes.count();
    
    for (let i = 0; i < count; i++) {
      await factCheckboxes.nth(i).check();
    }
    
    // Approve the selected facts
    await page.click('button:has-text("Approve Selected Facts")');
    
    // Wait for approval confirmation
    await page.waitForSelector('text=Facts approved successfully!', { timeout: 5000 });
    
    // Step 5: Create a high-risk post and transition to READY status
    const postResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: TEST_DATA.post
    });
    expect(postResponse.status()).toBe(200);
    const postData = await postResponse.json();
    const postId = postData.post.id;
    
    // Step 6: Update post status to READY (should succeed with approved artifacts)
    const updateResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        ...TEST_DATA.post,
        status: 'READY'
      }
    });
    
    // For high-risk posts, this should succeed because we have approved artifacts
    expect(updateResponse.status()).toBe(200);
    const updateData = await updateResponse.json();
    expect(updateData.post.status).toBe('READY');
    
    // Step 7: Verify the post can be transitioned to SCHEDULED
    const scheduleResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        ...TEST_DATA.post,
        status: 'SCHEDULED'
      }
    });
    
    expect(scheduleResponse.status()).toBe(200);
    const scheduleData = await scheduleResponse.json();
    expect(scheduleData.post.status).toBe('SCHEDULED');
  });
  
  test('should reject high-risk post without approved artifacts', async ({ page }) => {
    // Login as editor
    await mockLogin(page, 'editor');
    
    // Create a high-risk post
    const postResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: TEST_DATA.post
    });
    expect(postResponse.status()).toBe(200);
    const postData = await postResponse.json();
    const postId = postData.post.id;
    
    // Try to update post status to READY without approved artifacts
    const updateResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        ...TEST_DATA.post,
        status: 'READY'
      }
    });
    
    // Should fail for high-risk posts without approved artifacts
    expect(updateResponse.status()).toBe(400);
    const errorData = await updateResponse.json();
    expect(errorData.error).toContain('Cannot move high-risk post to READY status');
    expect(errorData.details.hasApprovedOutline).toBe(false);
    expect(errorData.details.hasApprovedFacts).toBe(false);
  });
});
