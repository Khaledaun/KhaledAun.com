'use client'

import { useState, useEffect } from 'react'

interface Fact {
  statement: string
  source?: string
  confidence: number
  category: string
}

interface FactsData {
  facts: Fact[]
  totalCount: number
}

interface FactsReviewModalProps {
  artifactId: string
  onClose: () => void
  onComplete: () => void
}

export function FactsReviewModal({ artifactId, onClose, onComplete }: FactsReviewModalProps) {
  const [facts, setFacts] = useState<Fact[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [approvedFacts, setApprovedFacts] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchFacts()
  }, [artifactId])

  const fetchFacts = async () => {
    try {
      const response = await fetch(`/api/ai/artifacts/${artifactId}`)
      if (response.ok) {
        const data = await response.json()
        const content: FactsData = JSON.parse(data.artifact.content)
        setFacts(content.facts)
        // Initialize all facts as approved by default
        const initialApproval: Record<number, boolean> = {}
        content.facts.forEach((_, index) => {
          initialApproval[index] = true
        })
        setApprovedFacts(initialApproval)
      }
    } catch (error) {
      console.error('Failed to fetch facts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFactApproval = (index: number) => {
    setApprovedFacts(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const reviewedFacts = facts.map((fact, index) => ({
        id: `fact-${index}`,
        statement: fact.statement,
        source: fact.source,
        confidence: fact.confidence,
        category: fact.category,
        approved: approvedFacts[index] || false
      }))

      const response = await fetch('/api/ai/facts/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artifactId,
          approvedFacts: reviewedFacts,
          feedback: feedback.trim() || undefined,
        }),
      })

      if (response.ok) {
        onComplete()
      } else {
        console.error('Failed to submit facts review')
      }
    } catch (error) {
      console.error('Error submitting facts review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const approvedCount = Object.values(approvedFacts).filter(Boolean).length

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Review Facts
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {approvedCount} of {facts.length} facts approved
              </p>
            </div>
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
          <div className="space-y-4">
            {facts.map((fact, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  approvedFacts[index] ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleFactApproval(index)}
                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          approvedFacts[index]
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {approvedFacts[index] && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-2">{fact.statement}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span
                            className={`px-2 py-1 rounded-full font-medium ${getConfidenceColor(fact.confidence)}`}
                          >
                            {Math.round(fact.confidence * 100)}% confidence
                          </span>
                          <span className="text-gray-600">Category: {fact.category}</span>
                          {fact.source && (
                            <span className="text-blue-600 truncate max-w-xs">
                              Source: {fact.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div className="mt-6">
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Feedback (optional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any feedback about the facts..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Click the checkboxes to approve/reject individual facts
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : `Submit Review (${approvedCount} approved)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}