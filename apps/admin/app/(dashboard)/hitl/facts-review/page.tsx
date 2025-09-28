'use client';

import { useState, useEffect } from 'react';

interface AIArtifact {
  id: string;
  type: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function FactsReview() {
  const [artifacts, setArtifacts] = useState<AIArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<AIArtifact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const loadArtifacts = async () => {
      try {
        // Load pending facts artifacts (stub data for now)
        setArtifacts([
          {
            id: '1',
            type: 'facts',
            content: 'Generated facts content for review...',
            status: 'pending_review',
            createdAt: '2024-01-01'
          },
          {
            id: '2',
            type: 'facts',
            content: 'Another set of facts awaiting approval...',
            status: 'pending_review',
            createdAt: '2024-01-02'
          }
        ]);
      } catch (error) {
        console.error('Error loading artifacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArtifacts();
  }, []);

  const approveFacts = async (artifactId: string) => {
    setIsApproving(true);
    try {
      // API call to approve facts would go here
      console.log('Approving facts artifact:', artifactId);
      
      // Remove from pending list
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
      setSelectedArtifact(null);
      
      alert('Facts approved successfully!');
    } catch (error) {
      console.error('Error approving facts:', error);
      alert('Error approving facts. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Facts Review</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Facts Review</h1>
      
      {artifacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No facts pending review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artifacts List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Facts</h2>
            <div className="space-y-4">
              {artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedArtifact?.id === artifact.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedArtifact(artifact)}
                >
                  <div className="font-medium">Facts #{artifact.id}</div>
                  <div className="text-sm text-gray-500">
                    Created: {artifact.createdAt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Details</h2>
            {selectedArtifact ? (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Facts Content:</h3>
                  <div className="p-4 bg-gray-50 rounded border text-sm">
                    {selectedArtifact.content}
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => approveFacts(selectedArtifact.id)}
                    disabled={isApproving}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isApproving ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => setSelectedArtifact(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a facts artifact to review</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}