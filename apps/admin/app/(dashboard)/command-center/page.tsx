'use client'

import { useState, useEffect } from 'react'
import { CommandCenterMetrics } from '../../../components/command-center/metrics'
import { PendingReviews } from '../../../components/command-center/pending-reviews'
import { ContentPipeline } from '../../../components/command-center/content-pipeline'
import { MediaGovernance } from '../../../components/command-center/media-governance'
import { SystemHealth } from '../../../components/command-center/system-health'
import { QuickActions } from '../../../components/command-center/quick-actions'

interface DashboardData {
  metrics: {
    totalIdeas: number
    pendingOutlines: number
    pendingFacts: number
    publishedPosts: number
    totalLeads: number
    mediaFiles: number
  }
  recentActivity: Array<{
    id: string
    type: string
    title: string
    status: string
    createdAt: string
  }>
  systemHealth: {
    database: boolean
    storage: boolean
    ai: boolean
    email: boolean
  }
}

export default function CommandCenterPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Command Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Command Center
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage your content pipeline, AI workflows, and system health
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">System Operational</span>
              </div>
              <button
                onClick={fetchDashboardData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'content', name: 'Content Pipeline' },
              { id: 'reviews', name: 'Pending Reviews' },
              { id: 'media', name: 'Media Governance' },
              { id: 'health', name: 'System Health' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <CommandCenterMetrics data={data?.metrics} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <QuickActions />
              <PendingReviews data={data?.recentActivity} />
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <ContentPipeline />
        )}

        {activeTab === 'reviews' && (
          <PendingReviews data={data?.recentActivity} expanded />
        )}

        {activeTab === 'media' && (
          <MediaGovernance />
        )}

        {activeTab === 'health' && (
          <SystemHealth data={data?.systemHealth} />
        )}
      </div>
    </div>
  )
}