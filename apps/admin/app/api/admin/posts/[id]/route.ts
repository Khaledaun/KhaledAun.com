import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../packages/auth';

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