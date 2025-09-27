import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { factIds, approved } = body;

    // Mock facts approval
    return NextResponse.json({
      success: true,
      approvedFacts: factIds,
      approved,
      message: 'Facts approved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to approve facts' },
      { status: 500 }
    );
  }
}
