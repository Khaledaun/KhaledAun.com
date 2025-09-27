import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, supabase } from '@khaledaun/auth';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAdmin(authHeader);
    
    // In a real implementation, this would delete the post from the database
    // The RLS policies would prevent editors from deleting posts
    return NextResponse.json({
      message: `Post ${params.id} deleted successfully`,
      user: user
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid or missing JWT token' },
          { status: 401 }
        );
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Forbidden - Admin role required' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAdmin(authHeader);
    
    const body = await request.json();
    const { status, riskLevel } = body;
    
    // HITL Business Logic: Validate high-risk posts moving to READY status
    if (status === 'READY' && riskLevel === 'HIGH') {
      // Check if post has required approved artifacts
      const hasApprovedOutline = await checkApprovedArtifact(params.id, 'outline_final');
      const hasApprovedFacts = await checkApprovedArtifact(params.id, 'facts');
      
      if (!hasApprovedOutline || !hasApprovedFacts) {
        return NextResponse.json(
          { 
            error: 'Cannot move high-risk post to READY status without approved outline and facts',
            details: {
              hasApprovedOutline,
              hasApprovedFacts,
              required: 'Both outline_final and facts artifacts must be APPROVED'
            }
          },
          { status: 400 }
        );
      }
    }
    
    // In a real implementation, this would update the post in the database
    return NextResponse.json({
      message: `Post ${params.id} updated successfully`,
      user: user,
      post: { id: params.id, ...body }
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid or missing JWT token' },
          { status: 401 }
        );
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Forbidden - Admin role required' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkApprovedArtifact(postId: string, artifactType: string): Promise<boolean> {
  try {
    if (!supabase) {
      // Mock validation for testing - simulate having approved artifacts
      console.log(`Mock: Checking ${artifactType} for post ${postId}`);
      return Math.random() > 0.5; // Random approval for testing
    }

    const { data, error } = await supabase
      .from('ai_artifacts')
      .select('id, status')
      .eq('postId', postId)
      .eq('type', artifactType)
      .eq('status', 'APPROVED')
      .limit(1);

    if (error) {
      console.error(`Error checking ${artifactType} artifact:`, error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error(`Error in checkApprovedArtifact:`, error);
    return false;
  }
}