import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Always respond with mock data, even if body is missing or invalid
  let optionId = "option-1";
  let outlineData = {};
  try {
    const body = await request.json().catch(() => ({}));
    optionId = body.optionId ?? "option-1";
    outlineData = body.outlineData ?? {};
  } catch (e) {
    // ignore errors and use defaults
  }
  return NextResponse.json({
    success: true,
    selectedOption: optionId,
    outline: outlineData,
    message: 'Outline option selected successfully',
  }, { status: 200 });
}