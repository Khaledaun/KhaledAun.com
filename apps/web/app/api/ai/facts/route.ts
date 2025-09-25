import { NextRequest, NextResponse } from 'next/server'
import { runTask, GenerateFactsSchema } from '@khaledaun/ai'
import { prisma } from '@khaledaun/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedInput = GenerateFactsSchema.parse(body)

    // Run AI task to generate facts
    const task = await runTask('generate-facts', validatedInput)

    // Create AI artifact for the facts
    const artifact = await prisma.aIArtifact.create({
      data: {
        type: 'FACTS',
        title: `Facts: ${validatedInput.topic}`,
        content: JSON.stringify(task.output),
        status: 'PENDING_REVIEW',
        userId: session.user.id,
        metadata: {
          taskId: task.id,
          input: validatedInput
        }
      }
    })

    return NextResponse.json({
      success: true,
      task,
      artifact
    })
  } catch (error) {
    console.error('Error generating facts:', error)
    return NextResponse.json(
      { error: 'Failed to generate facts' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING_REVIEW'
    const topic = searchParams.get('topic')

    const where: any = {
      type: 'FACTS',
      userId: session.user.id
    }

    if (status) {
      where.status = status
    }

    if (topic) {
      where.title = {
        contains: topic,
        mode: 'insensitive'
      }
    }

    const facts = await prisma.aIArtifact.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        idea: true,
        post: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      facts
    })
  } catch (error) {
    console.error('Error fetching facts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch facts' },
      { status: 500 }
    )
  }
}