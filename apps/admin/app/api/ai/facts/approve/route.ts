import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Always respond with mock approval
  return NextResponse.json({
    approved: true,
    message: 'Fact approved successfully',
  }, { status: 200 });
}