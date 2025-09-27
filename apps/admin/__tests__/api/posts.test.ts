import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from '../../app/api/admin/posts/[id]/route';

// Mock the auth module
vi.mock('@khaledaun/auth', () => ({
  requireAdmin: vi.fn(),
  supabase: null, // Use mock mode
}));

// Mock NextRequest
const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
  const request = {
    json: vi.fn().mockResolvedValue(body),
    headers: {
      get: vi.fn((key: string) => headers[key] || null),
    },
  } as unknown as NextRequest;
  
  return request;
};

describe('POST Status Change API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('riskLevel=HIGH validation', () => {
    it('should allow status change to READY when approvals exist', async () => {
      const { requireAdmin } = await import('@khaledaun/auth');
      
      // Mock successful admin auth
      vi.mocked(requireAdmin).mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin'
      });

      // Mock Math.random to return > 0.5 for both checks (approved)
      const originalRandom = Math.random;
      Math.random = vi.fn()
        .mockReturnValueOnce(0.8) // outline_final approved
        .mockReturnValueOnce(0.9); // facts approved

      const request = createMockRequest(
        {
          status: 'READY',
          riskLevel: 'HIGH',
          title: 'Test Post'
        },
        {
          'authorization': 'Bearer valid-admin-token'
        }
      );

      const response = await PUT(request, { params: { id: 'post-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('updated successfully');
      expect(data.post.status).toBe('READY');

      // Restore Math.random
      Math.random = originalRandom;
    });

    it('should reject status change to READY when approvals are missing', async () => {
      const { requireAdmin } = await import('@khaledaun/auth');
      
      // Mock successful admin auth
      vi.mocked(requireAdmin).mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin'
      });

      // Mock Math.random to return < 0.5 for both checks (not approved)
      const originalRandom = Math.random;
      Math.random = vi.fn()
        .mockReturnValueOnce(0.2) // outline_final not approved
        .mockReturnValueOnce(0.3); // facts not approved

      const request = createMockRequest(
        {
          status: 'READY',
          riskLevel: 'HIGH',
          title: 'Test Post'
        },
        {
          'authorization': 'Bearer valid-admin-token'
        }
      );

      const response = await PUT(request, { params: { id: 'post-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Cannot move high-risk post to READY status');
      expect(data.details.hasApprovedOutline).toBe(false);
      expect(data.details.hasApprovedFacts).toBe(false);

      // Restore Math.random
      Math.random = originalRandom;
    });

    it('should allow LOW risk posts to move to READY without approvals', async () => {
      const { requireAdmin } = await import('@khaledaun/auth');
      
      // Mock successful admin auth
      vi.mocked(requireAdmin).mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin'
      });

      const request = createMockRequest(
        {
          status: 'READY',
          riskLevel: 'LOW',
          title: 'Test Post'
        },
        {
          'authorization': 'Bearer valid-admin-token'
        }
      );

      const response = await PUT(request, { params: { id: 'post-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('updated successfully');
      expect(data.post.status).toBe('READY');
    });
  });
});
