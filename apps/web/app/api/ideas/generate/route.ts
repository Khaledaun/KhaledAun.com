import { NextRequest, NextResponse } from 'next/server'
import { runTask, GenerateOutlineSchema } from '@khaledaun/ai'
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
    const validatedInput = GenerateOutlineSchema.parse(body)

    // Create idea record
    const idea = await prisma.idea.create({
      data: {
        title: validatedInput.topic,
        description: `Generated idea for: ${validatedInput.topic}`,
        status: 'ACTIVE',
        priority: 'MEDIUM',
        tags: validatedInput.keywords || [],
        userId: session.user.id
      }
    })

    // Run AI task to generate outline
    const task = await runTask('generate-outline', validatedInput)

    // Create AI artifact
    const artifact = await prisma.aIArtifact.create({
      data: {
        type: 'OUTLINE',
        title: `Outline for: ${validatedInput.topic}`,
        content: JSON.stringify(task.output),
        status: 'PENDING_REVIEW',
        userId: session.user.id,
        ideaId: idea.id,
        metadata: {
          taskId: task.id,
          input: validatedInput
        }
      }
    })

    return NextResponse.json({
      success: true,
      idea,
      task,
      artifact
    })
  } catch (error) {
    console.error('Error generating idea:', error)
    return NextResponse.json(
      { error: 'Failed to generate idea' },
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.status = status
    }

    const ideas = await prisma.idea.findMany({
      where,
      include: {
        aiArtifacts: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.idea.count({ where })

    return NextResponse.json({
      ideas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}