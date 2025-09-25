import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@khaledaun/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { z } from 'zod'

const ChooseOutlineSchema = z.object({
  artifactId: z.string(),
  approved: z.boolean(),
  feedback: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { artifactId, approved, feedback } = ChooseOutlineSchema.parse(body)

    // Get the outline artifact
    const artifact = await prisma.aIArtifact.findUnique({
      where: { id: artifactId },
      include: { idea: true }
    })

    if (!artifact || artifact.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Outline not found or unauthorized' },
        { status: 404 }
      )
    }

    if (artifact.type !== 'OUTLINE') {
      return NextResponse.json(
        { error: 'Invalid artifact type' },
        { status: 400 }
      )
    }

    // Update the artifact status
    const updatedArtifact = await prisma.aIArtifact.update({
      where: { id: artifactId },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        approved,
        approvedAt: approved ? new Date() : null,
        metadata: {
          ...(artifact.metadata as any),
          feedback,
          reviewedAt: new Date().toISOString(),
          reviewedBy: session.user.id
        }
      }
    })

    // If approved and linked to an idea, update idea status
    if (approved && artifact.ideaId) {
      await prisma.idea.update({
        where: { id: artifact.ideaId },
        data: { status: 'ACTIVE' }
      })
    }

    return NextResponse.json({
      success: true,
      artifact: updatedArtifact,
      message: approved ? 'Outline approved successfully' : 'Outline rejected'
    })
  } catch (error) {
    console.error('Error choosing outline:', error)
    return NextResponse.json(
      { error: 'Failed to process outline choice' },
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

    // Get pending outline choices for HITL review
    const pendingOutlines = await prisma.aIArtifact.findMany({
      where: {
        type: 'OUTLINE',
        status: 'PENDING_REVIEW',
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
        idea: true
      },
      orderBy: {
        createdAt: 'asc' // Oldest first for review queue
      }
    })

    return NextResponse.json({
      pendingOutlines,
      count: pendingOutlines.length
    })
  } catch (error) {
    console.error('Error fetching pending outlines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending outlines' },
      { status: 500 }
    )
  }
}