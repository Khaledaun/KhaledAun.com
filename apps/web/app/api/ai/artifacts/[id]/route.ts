import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@khaledaun/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artifact = await prisma.aIArtifact.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!artifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this artifact
    if (artifact.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({ artifact })
  } catch (error) {
    console.error('Error fetching artifact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 500 }
    )
  }
}