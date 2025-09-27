import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Mock facts generation
    const facts = [
      {
        id: 'fact-1',
        statement: 'The average person spends 2.5 hours daily on social media.',
        source: 'Pew Research Center, 2023',
        verified: true,
      },
      {
        id: 'fact-2',
        statement: 'Content marketing generates 3x more leads than traditional marketing.',
        source: 'HubSpot, 2023',
        verified: true,
      },
      {
        id: 'fact-3',
        statement: 'Video content is 50x more likely to drive organic results than text.',
        source: 'Forrester Research, 2023',
        verified: false,
      },
    ];

    return NextResponse.json({
      success: true,
      facts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate facts' },
      { status: 500 }
    );
  }
}
