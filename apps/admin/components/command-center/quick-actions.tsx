'use client'

import { useState } from 'react'

export function QuickActions() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (action: string) => {
    setLoading(action)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (action) {
        case 'generate-idea':
          window.location.href = '/admin/ideas/new'
          break
        case 'create-post':
          window.location.href = '/admin/posts/new'
          break
        case 'review-outlines':
          window.location.href = '/admin/command-center?tab=reviews'
          break
        case 'upload-media':
          // Trigger file upload
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*,video/*'
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
              // Handle file upload
              console.log('Uploading file:', file.name)
            }
          }
          input.click()
          break
        case 'run-healthcheck':
          // Trigger health check refresh
          window.location.reload()
          break
        case 'export-data':
          // Trigger data export
          console.log('Exporting data...')
          break
      }
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error)
    } finally {
      setLoading(null)
    }
  }

  const actions = [
    {
      id: 'generate-idea',
      title: 'Generate New Idea',
      description: 'Create a new content idea using AI',
      icon: '💡',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      textColor: 'text-blue-700'
    },
    {
      id: 'create-post',
      title: 'Create Post',
      description: 'Start writing a new blog post',
      icon: '✍️',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      textColor: 'text-green-700'
    },
    {
      id: 'review-outlines',
      title: 'Review Outlines',
      description: 'Review pending AI-generated outlines',
      icon: '📝',
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
      textColor: 'text-yellow-700'
    },
    {
      id: 'upload-media',
      title: 'Upload Media',
      description: 'Add new images or videos',
      icon: '📁',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      textColor: 'text-purple-700'
    },
    {
      id: 'run-healthcheck',
      title: 'System Health',
      description: 'Check all services status',
      icon: '🔍',
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
      textColor: 'text-indigo-700'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download system data backup',
      icon: '📊',
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
      textColor: 'text-gray-700'
    }
  ]

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            disabled={loading === action.id}
            className={`relative p-4 rounded-lg border-2 text-left transition-colors ${action.color} ${
              loading === action.id ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${action.textColor}`}>
                  {action.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {action.description}
                </p>
                {loading === action.id && (
                  <div className="flex items-center mt-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-xs text-gray-600">Processing...</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Actions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>💡</span>
              <span className="text-gray-600">Generated idea: "AI in Web Development"</span>
            </div>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>📝</span>
              <span className="text-gray-600">Approved outline review</span>
            </div>
            <span className="text-xs text-gray-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>📁</span>
              <span className="text-gray-600">Uploaded hero-image.jpg</span>
            </div>
            <span className="text-xs text-gray-500">12 minutes ago</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">New Idea</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+I</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">New Post</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+P</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reviews</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+R</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Upload</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+U</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}