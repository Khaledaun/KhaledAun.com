'use client'

import { useState, useEffect } from 'react'

interface MediaFile {
  id: string
  filename: string
  mimetype: string
  size: number
  provider: string
  url: string
  createdAt: string
  issues?: string[]
}

export function MediaGovernance() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [showIssuesOnly, setShowIssuesOnly] = useState(false)

  const providers = ['all', 'SUPABASE', 'CLOUDINARY', 'IMGIX', 'LOCAL']

  useEffect(() => {
    fetchMediaFiles()
  }, [])

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        // Add mock governance issues for demonstration
        const filesWithIssues = data.media.map((file: any) => ({
          ...file,
          issues: Math.random() > 0.7 ? ['Missing alt text', 'Large file size'] : []
        }))
        setMediaFiles(filesWithIssues)
      }
    } catch (error) {
      console.error('Failed to fetch media files:', error)
      // Mock data for demonstration
      setMediaFiles([
        {
          id: '1',
          filename: 'hero-image.jpg',
          mimetype: 'image/jpeg',
          size: 2048000,
          provider: 'CLOUDINARY',
          url: 'https://example.com/image1.jpg',
          createdAt: new Date().toISOString(),
          issues: ['Missing alt text']
        },
        {
          id: '2',
          filename: 'large-video.mp4',
          mimetype: 'video/mp4',
          size: 52428800,
          provider: 'SUPABASE',
          url: 'https://example.com/video1.mp4',
          createdAt: new Date().toISOString(),
          issues: ['Large file size', 'No compression']
        },
        {
          id: '3',
          filename: 'thumbnail.png',
          mimetype: 'image/png',
          size: 512000,
          provider: 'IMGIX',
          url: 'https://example.com/thumb1.png',
          createdAt: new Date().toISOString(),
          issues: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = mediaFiles.filter(file => {
    if (selectedProvider !== 'all' && file.provider !== selectedProvider) {
      return false
    }
    if (showIssuesOnly && (!file.issues || file.issues.length === 0)) {
      return false
    }
    return true
  })

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'SUPABASE':
        return 'bg-green-100 text-green-800'
      case 'CLOUDINARY':
        return 'bg-blue-100 text-blue-800'
      case 'IMGIX':
        return 'bg-purple-100 text-purple-800'
      case 'LOCAL':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return '🖼️'
    if (mimetype.startsWith('video/')) return '🎥'
    if (mimetype.startsWith('audio/')) return '🎵'
    if (mimetype === 'application/pdf') return '📄'
    return '📁'
  }

  const totalIssues = mediaFiles.filter(f => f.issues && f.issues.length > 0).length

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Media Governance</h3>
            <p className="text-sm text-gray-600 mt-1">
              Monitor media files, compliance, and optimization opportunities
            </p>
          </div>
          {totalIssues > 0 && (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {totalIssues} files with issues
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Provider:</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {providers.map(provider => (
                <option key={provider} value={provider}>
                  {provider === 'all' ? 'All Providers' : provider}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="issues-filter"
              checked={showIssuesOnly}
              onChange={(e) => setShowIssuesOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="issues-filter" className="ml-2 text-sm text-gray-700">
              Show only files with issues
            </label>
          </div>
        </div>
      </div>

      {/* Media Files List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">
            Media Files ({filteredFiles.length})
          </h4>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredFiles.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-gray-400 text-4xl mb-2">📁</div>
              <p className="text-gray-500">
                {showIssuesOnly ? 'No files with issues found' : 'No media files found'}
              </p>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div key={file.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.filename}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{file.mimetype}</span>
                        <span>{formatFileSize(file.size)}</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProviderColor(file.provider)}`}
                        >
                          {file.provider}
                        </span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {file.issues && file.issues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {file.issues.map((issue, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        View
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-800">
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Governance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Storage Usage</h4>
          <div className="text-2xl font-bold text-gray-900">
            {formatFileSize(mediaFiles.reduce((sum, file) => sum + file.size, 0))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Total across all providers</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Compliance Issues</h4>
          <div className="text-2xl font-bold text-red-600">
            {totalIssues}
          </div>
          <p className="text-xs text-gray-500 mt-1">Files requiring attention</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Optimization Potential</h4>
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(mediaFiles.filter(f => f.size > 1024000).length / mediaFiles.length * 100) || 0}%
          </div>
          <p className="text-xs text-gray-500 mt-1">Files over 1MB that could be optimized</p>
        </div>
      </div>
    </div>
  )
}