import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Mock outline generation
    const outlineOptions = [
      {
        id: 'outline-1',
        title: 'Technical Deep Dive',
        structure: ['Introduction', 'Technical Overview', 'Implementation', 'Conclusion'],
        summary: 'A comprehensive technical analysis',
      },
      {
        id: 'outline-2', 
        title: 'Beginner-Friendly Guide',
        structure: ['What is it?', 'Why it matters', 'Getting Started', 'Next Steps'],
        summary: 'An accessible introduction for newcomers',
      },
    ];

    return NextResponse.json({
      success: true,
      options: outlineOptions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate outline options' },
      { status: 500 }
    );
  }
}
