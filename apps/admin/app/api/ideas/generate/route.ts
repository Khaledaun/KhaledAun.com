import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topics, locale } = body;

    // Mock idea generation
    const ideas = topics.map((topic: string) => ({
      id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      topic,
      title: `Generated idea for ${topic}`,
      description: `This is a generated idea about ${topic} for locale ${locale}`,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      created: ideas.length,
      ideas,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}
