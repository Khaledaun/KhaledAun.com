import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Mock lead creation (in real implementation, this would save to database)
    const lead = {
      id: `lead-${Date.now()}`,
      name,
      email,
      message,
      source: 'contact-form',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    // In a real implementation, you would:
    // 1. Save the lead to the database
    // 2. Send notification emails
    // 3. Trigger real-time updates

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      lead,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
