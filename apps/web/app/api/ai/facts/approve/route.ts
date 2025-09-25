import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@khaledaun/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { z } from 'zod'

const ApproveFactsSchema = z.object({
  artifactId: z.string(),
  approvedFacts: z.array(z.object({
    id: z.string().optional(),
    statement: z.string(),
    source: z.string().optional(),
    confidence: z.number().min(0).max(1),
    category: z.string(),
    approved: z.boolean()
  })),
  feedback: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { artifactId, approvedFacts, feedback } = ApproveFactsSchema.parse(body)

    // Get the facts artifact
    const artifact = await prisma.aIArtifact.findUnique({
      where: { id: artifactId },
      include: { idea: true, post: true }
    })

    if (!artifact || artifact.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Facts artifact not found or unauthorized' },
        { status: 404 }
      )
    }

    if (artifact.type !== 'FACTS') {
      return NextResponse.json(
        { error: 'Invalid artifact type' },
        { status: 400 }
      )
    }

    const approvedFactsCount = approvedFacts.filter(f => f.approved).length
    const hasApprovedFacts = approvedFactsCount > 0

    // Update the artifact with reviewed facts
    const updatedArtifact = await prisma.aIArtifact.update({
      where: { id: artifactId },
      data: {
        status: hasApprovedFacts ? 'APPROVED' : 'REJECTED',
        approved: hasApprovedFacts,
        approvedAt: hasApprovedFacts ? new Date() : null,
        content: JSON.stringify({
          originalFacts: JSON.parse(artifact.content as string),
          reviewedFacts: approvedFacts,
          approvedFactsCount,
          totalFactsCount: approvedFacts.length
        }),
        metadata: {
          ...(artifact.metadata as any),
          feedback,
          reviewedAt: new Date().toISOString(),
          reviewedBy: session.user.id,
          approvalStats: {
            approved: approvedFactsCount,
            rejected: approvedFacts.length - approvedFactsCount,
            total: approvedFacts.length
          }
        }
      }
    })

    // If linked to an idea and has approved facts, update idea status
    if (hasApprovedFacts && artifact.ideaId) {
      await prisma.idea.update({
        where: { id: artifact.ideaId },
        data: { status: 'ACTIVE' }
      })
    }

    return NextResponse.json({
      success: true,
      artifact: updatedArtifact,
      approvedCount: approvedFactsCount,
      totalCount: approvedFacts.length,
      message: hasApprovedFacts 
        ? `${approvedFactsCount} facts approved successfully`
        : 'All facts rejected'
    })
  } catch (error) {
    console.error('Error approving facts:', error)
    return NextResponse.json(
      { error: 'Failed to approve facts' },
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

    // Get pending facts for HITL review
    const pendingFacts = await prisma.aIArtifact.findMany({
      where: {
        type: 'FACTS',
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
        idea: true,
        post: true
      },
      orderBy: {
        createdAt: 'asc' // Oldest first for review queue
      }
    })

    return NextResponse.json({
      pendingFacts,
      count: pendingFacts.length
    })
  } catch (error) {
    console.error('Error fetching pending facts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending facts' },
      { status: 500 }
    )
  }
}