'use client'

import { useState, useEffect } from 'react'

interface PipelineItem {
  id: string
  title: string
  stage: string
  status: string
  createdAt: string
  updatedAt: string
}

export function ContentPipeline() {
  const [items, setItems] = useState<PipelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState('all')

  const stages = [
    { id: 'all', name: 'All Stages', color: 'gray' },
    { id: 'ideas', name: 'Ideas', color: 'blue' },
    { id: 'outline', name: 'Outline', color: 'yellow' },
    { id: 'facts', name: 'Facts', color: 'orange' },
    { id: 'content', name: 'Content', color: 'purple' },
    { id: 'review', name: 'Review', color: 'pink' },
    { id: 'published', name: 'Published', color: 'green' },
  ]

  useEffect(() => {
    fetchPipelineData()
  }, [])

  const fetchPipelineData = async () => {
    try {
      const [ideasRes, postsRes, artifactsRes] = await Promise.all([
        fetch('/api/ideas/generate'),
        fetch('/api/posts'),
        fetch('/api/ai/artifacts'),
      ])

      // Combine all data sources into pipeline items
      const mockItems: PipelineItem[] = [
        {
          id: '1',
          title: 'Introduction to AI in Web Development',
          stage: 'ideas',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          title: 'Building Modern React Applications',
          stage: 'outline',
          status: 'pending_review',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '3',
          title: 'TypeScript Best Practices',
          stage: 'facts',
          status: 'pending_review',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '4',
          title: 'Next.js Performance Optimization',
          stage: 'content',
          status: 'in_progress',
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
        },
        {
          id: '5',
          title: 'Database Design Principles',
          stage: 'review',
          status: 'pending_review',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          updatedAt: new Date(Date.now() - 21600000).toISOString(),
        },
        {
          id: '6',
          title: 'API Security Fundamentals',
          stage: 'published',
          status: 'published',
          createdAt: new Date(Date.now() - 518400000).toISOString(),
          updatedAt: new Date(Date.now() - 10800000).toISOString(),
        },
      ]

      setItems(mockItems)
    } catch (error) {
      console.error('Failed to fetch pipeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = selectedStage === 'all' 
    ? items 
    : items.filter(item => item.stage === selectedStage)

  const getStageColor = (stage: string) => {
    const stageObj = stages.find(s => s.id === stage)
    return stageObj?.color || 'gray'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🟢'
      case 'pending_review':
        return '🟡'
      case 'in_progress':
        return '🔵'
      case 'published':
        return '✅'
      default:
        return '⚪'
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stage Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content Pipeline</h3>
        <div className="flex flex-wrap gap-2">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStage === stage.id
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {stage.name}
              {stage.id !== 'all' && (
                <span className="ml-2 bg-white rounded-full px-2 py-0.5 text-xs">
                  {items.filter(item => item.stage === stage.id).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {item.title}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStageColor(item.stage)}-100 text-${getStageColor(item.stage)}-800`}
                    >
                      {stages.find(s => s.id === item.stage)?.name}
                    </span>
                    <span className="text-lg">{getStatusIcon(item.status)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
                    <div>Updated: {new Date(item.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Status: {item.status.replace('_', ' ')}
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-2">📝</div>
          <p className="text-gray-500">
            No items in {selectedStage === 'all' ? 'the pipeline' : `${stages.find(s => s.id === selectedStage)?.name.toLowerCase()} stage`}
          </p>
        </div>
      )}
    </div>
  )
}