'use client'

import { useState, useEffect } from 'react'
import { OutlineReviewModal } from './outline-review-modal'
import { FactsReviewModal } from './facts-review-modal'

interface ActivityItem {
  id: string
  type: string
  title: string
  status: string
  createdAt: string
}

interface PendingReviewsProps {
  data?: ActivityItem[]
  expanded?: boolean
}

export function PendingReviews({ data, expanded = false }: PendingReviewsProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(data || [])
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null)
  const [modalType, setModalType] = useState<'outline' | 'facts' | null>(null)
  const [loading, setLoading] = useState(!data)

  useEffect(() => {
    if (!data) {
      fetchPendingReviews()
    }
  }, [data])

  const fetchPendingReviews = async () => {
    try {
      setLoading(true)
      const [outlinesRes, factsRes] = await Promise.all([
        fetch('/api/ai/outline/choose'),
        fetch('/api/ai/facts/approve'),
      ])

      const [outlinesData, factsData] = await Promise.all([
        outlinesRes.json(),
        factsRes.json(),
      ])

      const combined = [
        ...(outlinesData.pendingOutlines || []).map((item: any) => ({
          id: item.id,
          type: 'outline',
          title: item.title,
          status: item.status,
          createdAt: item.createdAt,
        })),
        ...(factsData.pendingFacts || []).map((item: any) => ({
          id: item.id,
          type: 'facts',
          title: item.title,
          status: item.status,
          createdAt: item.createdAt,
        })),
      ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      setActivities(combined)
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (item: ActivityItem) => {
    setSelectedItem(item)
    setModalType(item.type as 'outline' | 'facts')
  }

  const handleReviewComplete = () => {
    setSelectedItem(null)
    setModalType(null)
    fetchPendingReviews() // Refresh the list
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'outline':
        return '📝'
      case 'facts':
        return '🔍'
      default:
        return '📄'
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const displayItems = expanded ? activities : activities.slice(0, 5)

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Pending Reviews
              {activities.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {activities.length} pending
                </span>
              )}
            </h3>
            {!expanded && activities.length > 5 && (
              <button
                onClick={() => window.location.href = '/admin/command-center?tab=reviews'}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {displayItems.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-gray-400 text-4xl mb-2">✅</div>
              <p className="text-gray-500">No pending reviews</p>
            </div>
          ) : (
            displayItems.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getTypeIcon(item.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()} •{' '}
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status.replace('_', ' ').toLowerCase()}
                    </span>
                    <button
                      onClick={() => handleReview(item)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modals */}
      {modalType === 'outline' && selectedItem && (
        <OutlineReviewModal
          artifactId={selectedItem.id}
          onClose={() => setModalType(null)}
          onComplete={handleReviewComplete}
        />
      )}

      {modalType === 'facts' && selectedItem && (
        <FactsReviewModal
          artifactId={selectedItem.id}
          onClose={() => setModalType(null)}
          onComplete={handleReviewComplete}
        />
      )}
    </>
  )
}