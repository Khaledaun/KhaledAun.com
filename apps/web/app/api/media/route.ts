import { NextRequest, NextResponse } from 'next/server'
import { createMediaManager, MediaProvider } from '@khaledaun/worker/media'
import { prisma } from '@khaledaun/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const mediaManager = createMediaManager()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const provider = formData.get('provider') as MediaProvider || undefined

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to media service
    const uploadResult = await mediaManager.upload({
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      buffer,
      metadata: {
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString()
      }
    }, provider)

    // Save media record to database
    const media = await prisma.media.create({
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        filename: file.name,
        mimetype: file.type,
        size: uploadResult.size,
        width: uploadResult.width,
        height: uploadResult.height,
        provider: uploadResult.provider,
        metadata: uploadResult.metadata
      }
    })

    return NextResponse.json({
      success: true,
      media,
      uploadResult
    })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const provider = searchParams.get('provider') as MediaProvider
    const mimetype = searchParams.get('mimetype')

    const where: any = {}

    if (provider) {
      where.provider = provider
    }

    if (mimetype) {
      where.mimetype = {
        startsWith: mimetype
      }
    }

    const media = await prisma.media.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.media.count({ where })

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID required' },
        { status: 400 }
      )
    }

    // Get media record
    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Delete from storage
    if (media.key) {
      await mediaManager.delete(
        { key: media.key, url: media.url },
        media.provider as MediaProvider
      )
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: mediaId }
    })

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}