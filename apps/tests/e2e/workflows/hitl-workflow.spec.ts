import { test, expect } from '@playwright/test';
import {
  mockLogin,
  authenticatedRequest,
  navigateToCommandCenter,
  navigateToOutlineReview,
  navigateToFactsReview,
  TEST_DATA
} from '../../test-utils';

test.describe('HITL (Human-in-the-Loop) Workflow - Approval Processes', () => {
  
  test('should complete full HITL workflow for high-risk content', async ({ page }) => {
    console.log('Testing full HITL workflow for high-risk content...');
    
    await mockLogin(page, 'editor');
    
    // Step 1: Create a high-risk post that requires HITL approval
    console.log('Step 1: Creating high-risk post...');
    const postData = {
      title: 'High-Risk Content Requiring HITL Approval',
      content: 'This is high-risk content that requires human approval before publication.',
      riskLevel: 'HIGH',
      status: 'DRAFT'
    };
    
    const postResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: postData
    });
    
    expect(postResponse.status()).toBe(200);
    const postResult = await postResponse.json();
    const postId = postResult.post.id;
    console.log(`Created high-risk post with ID: ${postId}`);
    
    // Step 2: Verify post is in DRAFT status and cannot move to READY
    console.log('Step 2: Verifying post cannot move to READY without approvals...');
    const updateResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        status: 'READY'
      }
    });
    
    expect(updateResponse.status()).toBe(400);
    const errorData = await updateResponse.json();
    expect(errorData.error).toContain('approved');
    console.log('✅ High-risk post correctly blocked from READY status');
    
    // Step 3: Generate outline options for HITL review
    console.log('Step 3: Generating outline options for HITL review...');
    const outlineResponse = await authenticatedRequest(page, '/api/ai/outline', {
      method: 'POST',
      data: {
        ideaId: postId,
        topic: postData.title
      }
    });
    
    expect(outlineResponse.status()).toBe(200);
    const outlineData = await outlineResponse.json();
    expect(outlineData.options).toBeTruthy();
    expect(outlineData.options.length).toBeGreaterThan(0);
    
    const outlineOptions = outlineData.options;
    console.log(`Generated ${outlineOptions.length} outline options`);
    
    // Step 4: Navigate to outline review and select an option
    console.log('Step 4: Reviewing and selecting outline...');
    await navigateToOutlineReview(page);
    
    // Verify outline options are displayed
    await expect(page.locator('[data-testid="outline-option"]')).toHaveCount(outlineOptions.length);
    
    // Select the first outline option
    const selectedOption = outlineOptions[0];
    await page.click(`[data-testid="outline-option-${selectedOption.id}"]`);
    await page.click('[data-testid="select-outline-btn"]');
    
    // Confirm selection via API
    const chooseResponse = await authenticatedRequest(page, '/api/ai/outline/choose', {
      method: 'POST',
      data: {
        optionId: selectedOption.id,
        outlineData: selectedOption
      }
    });
    
    expect(chooseResponse.status()).toBe(200);
    console.log('✅ Outline selected and approved');
    
    // Step 5: Generate facts for HITL review
    console.log('Step 5: Generating facts for HITL review...');
    const factsResponse = await authenticatedRequest(page, '/api/ai/facts', {
      method: 'POST',
      data: {
        ideaId: postId,
        outlineId: selectedOption.id
      }
    });
    
    expect(factsResponse.status()).toBe(200);
    const factsData = await factsResponse.json();
    expect(factsData.facts).toBeTruthy();
    expect(factsData.facts.length).toBeGreaterThan(0);
    
    const facts = factsData.facts;
    console.log(`Generated ${facts.length} facts for review`);
    
    // Step 6: Navigate to facts review and approve facts
    console.log('Step 6: Reviewing and approving facts...');
    await navigateToFactsReview(page);
    
    // Verify facts are displayed
    await expect(page.locator('[data-testid="fact-item"]')).toHaveCount(facts.length);
    
    // Select all facts for approval
    const factIds = facts.map((fact: any) => fact.id);
    for (const factId of factIds) {
      await page.check(`[data-testid="fact-checkbox-${factId}"]`);
    }
    
    await page.click('[data-testid="approve-facts-btn"]');
    
    // Confirm approval via API
    const approveResponse = await authenticatedRequest(page, '/api/ai/facts/approve', {
      method: 'POST',
      data: {
        factIds: factIds,
        approved: true
      }
    });
    
    expect(approveResponse.status()).toBe(200);
    console.log('✅ Facts reviewed and approved');
    
    // Step 7: Now the post should be able to move to READY status
    console.log('Step 7: Moving post to READY status after approvals...');
    const finalUpdateResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        status: 'READY'
      }
    });
    
    expect(finalUpdateResponse.status()).toBe(200);
    const finalResult = await finalUpdateResponse.json();
    expect(finalResult.post.status).toBe('READY');
    console.log('✅ Post successfully moved to READY status after HITL approvals');
    
    // Step 8: Verify in Command Center
    console.log('Step 8: Verifying post in Command Center...');
    await navigateToCommandCenter(page);
    
    // Check that the post appears in the Content Pipeline with READY status
    await expect(page.locator(`[data-testid="post-${postId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="post-status-${postId}"]`)).toHaveText('READY');
    
    // Check that HITL approvals are reflected in the UI
    await expect(page.locator(`[data-testid="post-outline-approved-${postId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="post-facts-approved-${postId}"]`)).toBeVisible();
    
    console.log('✅ HITL workflow completed successfully!');
  });

  test('should handle partial HITL approvals', async ({ page }) => {
    console.log('Testing partial HITL approvals...');
    
    await mockLogin(page, 'editor');
    
    // Create high-risk post
    const postData = {
      title: 'Partial HITL Approval Test',
      content: 'Testing partial approval workflow.',
      riskLevel: 'HIGH',
      status: 'DRAFT'
    };
    
    const postResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: postData
    });
    
    expect(postResponse.status()).toBe(200);
    const postResult = await postResponse.json();
    const postId = postResult.post.id;
    
    // Generate outline and approve it
    const outlineResponse = await authenticatedRequest(page, '/api/ai/outline', {
      method: 'POST',
      data: {
        ideaId: postId,
        topic: postData.title
      }
    });
    
    const outlineData = await outlineResponse.json();
    const selectedOption = outlineData.options[0];
    
    await authenticatedRequest(page, '/api/ai/outline/choose', {
      method: 'POST',
      data: {
        optionId: selectedOption.id,
        outlineData: selectedOption
      }
    });
    
    console.log('✅ Outline approved');
    
    // Generate facts but don't approve them
    const factsResponse = await authenticatedRequest(page, '/api/ai/facts', {
      method: 'POST',
      data: {
        ideaId: postId,
        outlineId: selectedOption.id
      }
    });
    
    const factsData = await factsResponse.json();
    console.log(`Generated ${factsData.facts.length} facts (not approved)`);
    
    // Try to move to READY status - should fail because facts are not approved
    const updateResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        status: 'READY'
      }
    });
    
    expect(updateResponse.status()).toBe(400);
    const errorData = await updateResponse.json();
    expect(errorData.error).toContain('facts');
    console.log('✅ Post correctly blocked - facts not approved');
  });

  test('should handle HITL rejection workflow', async ({ page }) => {
    console.log('Testing HITL rejection workflow...');
    
    await mockLogin(page, 'editor');
    
    // Create high-risk post
    const postData = {
      title: 'HITL Rejection Test',
      content: 'Testing rejection workflow.',
      riskLevel: 'HIGH',
      status: 'DRAFT'
    };
    
    const postResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: postData
    });
    
    expect(postResponse.status()).toBe(200);
    const postResult = await postResponse.json();
    const postId = postResult.post.id;
    
    // Generate outline options
    const outlineResponse = await authenticatedRequest(page, '/api/ai/outline', {
      method: 'POST',
      data: {
        ideaId: postId,
        topic: postData.title
      }
    });
    
    const outlineData = await outlineResponse.json();
    const outlineOptions = outlineData.options;
    
    // Navigate to outline review
    await navigateToOutlineReview(page);
    
    // Reject all outline options
    for (const option of outlineOptions) {
      await page.click(`[data-testid="reject-outline-${option.id}"]`);
    }
    
    await page.click('[data-testid="reject-all-outlines-btn"]');
    
    // Confirm rejection via API
    const rejectResponse = await authenticatedRequest(page, '/api/ai/outline/choose', {
      method: 'POST',
      data: {
        optionId: null,
        outlineData: null,
        rejected: true
      }
    });
    
    expect(rejectResponse.status()).toBe(200);
    console.log('✅ All outline options rejected');
    
    // Post should remain in DRAFT status
    const getPostResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`);
    const postDetails = await getPostResponse.json();
    expect(postDetails.post.status).toBe('DRAFT');
    
    // Should show rejection reason in UI
    await navigateToCommandCenter(page);
    await expect(page.locator(`[data-testid="post-rejected-${postId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="rejection-reason-${postId}"]`)).toContainText('outline');
    
    console.log('✅ HITL rejection workflow completed');
  });

  test('should handle HITL workflow with multiple reviewers', async ({ page, context }) => {
    console.log('Testing HITL workflow with multiple reviewers...');
    
    // Create multiple browser contexts for different reviewers
    const editorPage = await context.newPage();
    const adminPage = await context.newPage();
    
    // Login as different users
    await mockLogin(editorPage, 'editor');
    await mockLogin(adminPage, 'admin');
    
    // Editor creates high-risk post
    const postData = {
      title: 'Multi-Reviewer HITL Test',
      content: 'Testing multiple reviewer workflow.',
      riskLevel: 'HIGH',
      status: 'DRAFT'
    };
    
    const postResponse = await authenticatedRequest(editorPage, '/api/admin/posts', {
      method: 'POST',
      data: postData
    });
    
    expect(postResponse.status()).toBe(200);
    const postResult = await postResponse.json();
    const postId = postResult.post.id;
    
    // Generate outline options
    const outlineResponse = await authenticatedRequest(editorPage, '/api/ai/outline', {
      method: 'POST',
      data: {
        ideaId: postId,
        topic: postData.title
      }
    });
    
    const outlineData = await outlineResponse.json();
    const selectedOption = outlineData.options[0];
    
    // Editor selects outline
    await authenticatedRequest(editorPage, '/api/ai/outline/choose', {
      method: 'POST',
      data: {
        optionId: selectedOption.id,
        outlineData: selectedOption
      }
    });
    
    console.log('✅ Editor selected outline');
    
    // Admin reviews and approves the same outline
    await navigateToOutlineReview(adminPage);
    await expect(adminPage.locator(`[data-testid="outline-option-${selectedOption.id}"]`)).toBeVisible();
    await adminPage.click(`[data-testid="outline-option-${selectedOption.id}"]`);
    await adminPage.click('[data-testid="approve-outline-btn"]');
    
    console.log('✅ Admin approved outline');
    
    // Generate facts
    const factsResponse = await authenticatedRequest(editorPage, '/api/ai/facts', {
      method: 'POST',
      data: {
        ideaId: postId,
        outlineId: selectedOption.id
      }
    });
    
    const factsData = await factsResponse.json();
    const factIds = factsData.facts.map((fact: any) => fact.id);
    
    // Editor approves facts
    await navigateToFactsReview(editorPage);
    for (const factId of factIds) {
      await editorPage.check(`[data-testid="fact-checkbox-${factId}"]`);
    }
    await editorPage.click('[data-testid="approve-facts-btn"]');
    
    console.log('✅ Editor approved facts');
    
    // Admin can now move post to READY status
    const updateResponse = await authenticatedRequest(adminPage, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        status: 'READY'
      }
    });
    
    expect(updateResponse.status()).toBe(200);
    console.log('✅ Admin moved post to READY status');
    
    // Cleanup
    await editorPage.close();
    await adminPage.close();
  });

  test('should handle HITL workflow timeouts and retries', async ({ page }) => {
    console.log('Testing HITL workflow timeouts and retries...');
    
    await mockLogin(page, 'editor');
    
    // Create high-risk post
    const postData = {
      title: 'HITL Timeout Test',
      content: 'Testing timeout and retry workflow.',
      riskLevel: 'HIGH',
      status: 'DRAFT'
    };
    
    const postResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: postData
    });
    
    expect(postResponse.status()).toBe(200);
    const postResult = await postResponse.json();
    const postId = postResult.post.id;
    
    // Mock slow outline generation
    await page.route('/api/ai/outline', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      route.continue();
    });
    
    // Generate outline with timeout
    const outlineResponse = await authenticatedRequest(page, '/api/ai/outline', {
      method: 'POST',
      data: {
        ideaId: postId,
        topic: postData.title
      }
    });
    
    expect(outlineResponse.status()).toBe(200);
    console.log('✅ Outline generation with timeout handled');
    
    // Test retry mechanism
    await navigateToOutlineReview(page);
    
    // If outline generation failed, retry button should be visible
    const retryButton = page.locator('[data-testid="retry-outline-generation"]');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Retry mechanism working');
    }
  });

  test('should handle HITL workflow with concurrent operations', async ({ page, context }) => {
    console.log('Testing HITL workflow with concurrent operations...');
    
    // Create multiple contexts for concurrent operations
    const contexts = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage()
    ]);
    
    // Login all contexts as editor
    await Promise.all(contexts.map(async (ctx) => {
      await mockLogin(ctx, 'editor');
    }));
    
    // Create multiple high-risk posts concurrently
    const postPromises = contexts.map(async (ctx, index) => {
      const postData = {
        title: `Concurrent HITL Post ${index + 1}`,
        content: `Concurrent HITL post content ${index + 1}`,
        riskLevel: 'HIGH',
        status: 'DRAFT'
      };
      
      return authenticatedRequest(ctx, '/api/admin/posts', {
        method: 'POST',
        data: postData
      });
    });
    
    const postResponses = await Promise.all(postPromises);
    
    // All posts should be created successfully
    postResponses.forEach((response, index) => {
      expect(response.status()).toBe(200);
      console.log(`✅ Concurrent HITL post ${index + 1} created`);
    });
    
    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));
  });
});
