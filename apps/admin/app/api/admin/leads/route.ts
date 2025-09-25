import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '../../../../../packages/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await getUser(authHeader);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing JWT token' },
        { status: 401 }
      );
    }
    
    // Check if user has admin or ops role (for RLS testing)
    if (!['admin', 'ops'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Ops role required' },
        { status: 403 }
      );
    }
    
    // In a real implementation, this would fetch leads from the database
    // The RLS policies would restrict access based on user role
    return NextResponse.json({
      message: 'Leads retrieved successfully',
      user: user,
      leads: [] // placeholder
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}