import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@khaledaun/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAdmin(authHeader);
    
    // In a real implementation, this would fetch posts from the database
    return NextResponse.json({
      message: 'Posts retrieved successfully',
      user: user,
      posts: [] // placeholder
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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await requireAdmin(authHeader);
    
    const body = await request.json();
    
    // In a real implementation, this would create a post in the database
    return NextResponse.json({
      message: 'Post created successfully',
      user: user,
      post: { id: 'new-post-id', ...body }
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