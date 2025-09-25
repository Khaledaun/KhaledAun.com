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

    // Run AI task to generate outline
    const task = await runTask('generate-outline', validatedInput)

    // Create AI artifact for the outline
    const artifact = await prisma.aIArtifact.create({
      data: {
        type: 'OUTLINE',
        title: `Outline: ${validatedInput.topic}`,
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
    console.error('Error generating outline:', error)
    return NextResponse.json(
      { error: 'Failed to generate outline' },
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

    const outlines = await prisma.aIArtifact.findMany({
      where: {
        type: 'OUTLINE',
        status: status as any,
        userId: session.user.id
      },
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
      outlines
    })
  } catch (error) {
    console.error('Error fetching outlines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outlines' },
      { status: 500 }
    )
  }
}