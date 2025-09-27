import { test, expect } from '@playwright/test';
import {
  mockLogin,
  authenticatedRequest,
  navigateToCommandCenter,
  navigateToOutlineReview,
  navigateToFactsReview,
  TEST_DATA,
  TEST_USERS
} from '../test-utils';

test.describe('Content Creation Workflow - Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login as editor for content creation
    await mockLogin(page, 'editor');
  });

  test('should complete full content creation workflow from idea to published post', async ({ page }) => {
    // Step 1: Create an idea
    console.log('Step 1: Creating content idea...');
    const ideaResponse = await authenticatedRequest(page, '/api/ideas/generate', {
      method: 'POST',
      data: {
        topics: ['E2E Testing', 'Content Creation'],
        locale: 'en'
      }
    });
    
    expect(ideaResponse.ok()).toBeTruthy();
    const ideaData = await ideaResponse.json();
    expect(ideaData.created).toBe(1);
    expect(ideaData.ideaId).toBeTruthy();
    
    const ideaId = ideaData.ideaId;
    console.log(`Created idea with ID: ${ideaId}`);

    // Step 2: Generate outline options
    console.log('Step 2: Generating outline options...');
    const outlineResponse = await authenticatedRequest(page, '/api/ai/outline', {
      method: 'POST',
      data: {
        ideaId: ideaId,
        topic: 'E2E Testing and Content Creation'
      }
    });
    
    expect(outlineResponse.ok()).toBeTruthy();
    const outlineData = await outlineResponse.json();
    expect(outlineData.options).toBeTruthy();
    expect(outlineData.options.length).toBeGreaterThan(0);
    
    const outlineOptions = outlineData.options;
    console.log(`Generated ${outlineOptions.length} outline options`);

    // Step 3: Navigate to outline review and select an option
    console.log('Step 3: Reviewing and selecting outline...');
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
    
    expect(chooseResponse.ok()).toBeTruthy();
    console.log('Outline selected and approved');

    // Step 4: Generate facts for the content
    console.log('Step 4: Generating facts...');
    const factsResponse = await authenticatedRequest(page, '/api/ai/facts', {
      method: 'POST',
      data: {
        ideaId: ideaId,
        outlineId: selectedOption.id
      }
    });
    
    expect(factsResponse.ok()).toBeTruthy();
    const factsData = await factsResponse.json();
    expect(factsData.facts).toBeTruthy();
    expect(factsData.facts.length).toBeGreaterThan(0);
    
    const facts = factsData.facts;
    console.log(`Generated ${facts.length} facts`);

    // Step 5: Navigate to facts review and approve facts
    console.log('Step 5: Reviewing and approving facts...');
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
    
    expect(approveResponse.ok()).toBeTruthy();
    console.log('Facts reviewed and approved');

    // Step 6: Create the post
    console.log('Step 6: Creating the post...');
    const postData = {
      title: 'E2E Testing: Complete Content Creation Workflow',
      content: 'This post was created through the complete E2E testing workflow, demonstrating the full content creation process from idea generation to post creation.',
      ideaId: ideaId,
      outlineId: selectedOption.id,
      riskLevel: 'HIGH', // High risk to test HITL workflow
      status: 'DRAFT'
    };
    
    const postResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: postData
    });
    
    expect(postResponse.ok()).toBeTruthy();
    const postResult = await postResponse.json();
    expect(postResult.post).toBeTruthy();
    expect(postResult.post.id).toBeTruthy();
    
    const postId = postResult.post.id;
    console.log(`Created post with ID: ${postId}`);

    // Step 7: Verify post status is DRAFT (high-risk posts start as DRAFT)
    console.log('Step 7: Verifying initial post status...');
    const getPostResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`);
    expect(getPostResponse.ok()).toBeTruthy();
    
    const postDetails = await getPostResponse.json();
    expect(postDetails.post.status).toBe('DRAFT');
    expect(postDetails.post.riskLevel).toBe('HIGH');
    console.log('Post confirmed as DRAFT with HIGH risk level');

    // Step 8: Attempt to move to READY status (should succeed with approved artifacts)
    console.log('Step 8: Moving post to READY status...');
    const updateResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        status: 'READY'
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    const updateResult = await updateResponse.json();
    expect(updateResult.post.status).toBe('READY');
    console.log('Post successfully moved to READY status');

    // Step 9: Verify in Command Center
    console.log('Step 9: Verifying post in Command Center...');
    await navigateToCommandCenter(page);
    
    // Check that the post appears in the Content Pipeline
    await expect(page.locator(`[data-testid="post-${postId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="post-status-${postId}"]`)).toHaveText('READY');
    console.log('Post verified in Command Center');

    // Step 10: Final verification - get post details
    console.log('Step 10: Final verification...');
    const finalPostResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`);
    expect(finalPostResponse.ok()).toBeTruthy();
    
    const finalPost = await finalPostResponse.json();
    expect(finalPost.post.status).toBe('READY');
    expect(finalPost.post.title).toBe(postData.title);
    expect(finalPost.post.riskLevel).toBe('HIGH');
    
    console.log('✅ Content creation workflow completed successfully!');
    console.log(`Final post status: ${finalPost.post.status}`);
    console.log(`Post title: ${finalPost.post.title}`);
  });

  test('should handle high-risk post without approved artifacts', async ({ page }) => {
    // Create a high-risk post without going through the approval workflow
    console.log('Testing high-risk post without approved artifacts...');
    
    const postData = {
      title: 'High-Risk Post Without Approvals',
      content: 'This post should fail to move to READY status.',
      riskLevel: 'HIGH',
      status: 'DRAFT'
    };
    
    // Create the post
    const postResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: postData
    });
    
    expect(postResponse.ok()).toBeTruthy();
    const postResult = await postResponse.json();
    const postId = postResult.post.id;
    
    // Attempt to move to READY status (should fail)
    const updateResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        status: 'READY'
      }
    });
    
    // Should return an error for high-risk posts without approvals
    expect(updateResponse.status()).toBe(400);
    const errorData = await updateResponse.json();
    expect(errorData.error).toContain('approved');
    
    console.log('✅ High-risk post correctly blocked without approvals');
  });

  test('should allow low-risk post to transition freely', async ({ page }) => {
    // Create a low-risk post that should transition freely
    console.log('Testing low-risk post free transitions...');
    
    const postData = {
      title: 'Low-Risk Post Free Transitions',
      content: 'This post should transition freely between statuses.',
      riskLevel: 'LOW',
      status: 'DRAFT'
    };
    
    // Create the post
    const postResponse = await authenticatedRequest(page, '/api/admin/posts', {
      method: 'POST',
      data: postData
    });
    
    expect(postResponse.ok()).toBeTruthy();
    const postResult = await postResponse.json();
    const postId = postResult.post.id;
    
    // Move to READY status (should succeed)
    const updateResponse = await authenticatedRequest(page, `/api/admin/posts/${postId}`, {
      method: 'PUT',
      data: {
        status: 'READY'
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    const updateResult = await updateResponse.json();
    expect(updateResult.post.status).toBe('READY');
    
    console.log('✅ Low-risk post successfully transitioned to READY');
  });
});
