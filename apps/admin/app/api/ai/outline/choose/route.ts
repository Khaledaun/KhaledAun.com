import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { optionId, outlineData } = body;

    // Mock outline selection
    return NextResponse.json({
      success: true,
      selectedOption: optionId,
      outline: outlineData,
      message: 'Outline option selected successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to select outline option' },
      { status: 500 }
    );
  }
}
