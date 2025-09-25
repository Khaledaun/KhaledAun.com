'use client'

import { useState, useEffect } from 'react'

interface OutlineSection {
  heading: string
  subheadings: string[]
  keyPoints: string[]
}

interface OutlineData {
  title: string
  sections: OutlineSection[]
  estimatedWordCount: number
}

interface OutlineReviewModalProps {
  artifactId: string
  onClose: () => void
  onComplete: () => void
}

export function OutlineReviewModal({ artifactId, onClose, onComplete }: OutlineReviewModalProps) {
  const [outline, setOutline] = useState<OutlineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    fetchOutline()
  }, [artifactId])

  const fetchOutline = async () => {
    try {
      const response = await fetch(`/api/ai/artifacts/${artifactId}`)
      if (response.ok) {
        const data = await response.json()
        const content = JSON.parse(data.artifact.content)
        setOutline(content)
      }
    } catch (error) {
      console.error('Failed to fetch outline:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (approved: boolean) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/ai/outline/choose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artifactId,
          approved,
          feedback: feedback.trim() || undefined,
        }),
      })

      if (response.ok) {
        onComplete()
      } else {
        console.error('Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Review Outline: {outline?.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {outline && (
            <div className="space-y-6">
              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Estimated Word Count:</span>
                    <span className="ml-2 text-gray-900">{outline.estimatedWordCount}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sections:</span>
                    <span className="ml-2 text-gray-900">{outline.sections.length}</span>
                  </div>
                </div>
              </div>

              {/* Outline Sections */}
              <div className="space-y-4">
                {outline.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {index + 1}. {section.heading}
                    </h3>
                    
                    {section.subheadings.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Subheadings:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {section.subheadings.map((subheading, subIndex) => (
                            <li key={subIndex}>{subheading}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.keyPoints.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Points:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {section.keyPoints.map((point, pointIndex) => (
                            <li key={pointIndex}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Feedback */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (optional)
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any feedback or suggestions..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleApprove(false)}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Reject'}
          </button>
          <button
            onClick={() => handleApprove(true)}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}