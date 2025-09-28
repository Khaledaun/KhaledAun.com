'use client';

import { useState, useEffect } from 'react';

interface OutlineOption {
  id: string;
  title: string;
  content: string;
}

interface AIArtifact {
  id: string;
  type: string;
  options: OutlineOption[];
  status: string;
  createdAt: string;
}

export default function OutlineReview() {
  const [artifacts, setArtifacts] = useState<AIArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<AIArtifact | null>(null);
  const [selectedOption, setSelectedOption] = useState<OutlineOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const loadArtifacts = async () => {
      try {
        // Load pending outline artifacts (stub data for now)
        setArtifacts([
          {
            id: '1',
            type: 'outline',
            options: [
              { id: '1a', title: 'Option A', content: 'First outline option content...' },
              { id: '1b', title: 'Option B', content: 'Second outline option content...' },
            ],
            status: 'pending_review',
            createdAt: '2024-01-01'
          },
          {
            id: '2',
            type: 'outline',
            options: [
              { id: '2a', title: 'Option A', content: 'Another outline option...' },
              { id: '2b', title: 'Option B', content: 'Alternative outline approach...' },
            ],
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

  const approveOutline = async (artifactId: string, selectedOptionId: string) => {
    if (!selectedOption) return;

    setIsApproving(true);
    try {
      // API call to approve outline would go here
      console.log('Approving outline artifact:', artifactId, 'option:', selectedOptionId);

      // Remove from pending list
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
      setSelectedArtifact(null);
      setSelectedOption(null);
      
      alert('Outline approved successfully!');
    } catch (error) {
      console.error('Error approving outline:', error);
      alert('Error approving outline. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Outline Review</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Outline Review</h1>
      
      {artifacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No outlines pending review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artifacts List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Outlines</h2>
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
                  <div className="font-medium">Outline #{artifact.id}</div>
                  <div className="text-sm text-gray-500">
                    {artifact.options.length} options
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {artifact.createdAt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Outline Options</h2>
            {selectedArtifact ? (
              <div className="space-y-4">
                {selectedArtifact.options.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedOption?.id === option.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedOption(option)}
                  >
                    <div className="font-medium">{option.title}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      {option.content.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Select an outline to view options</p>
            )}
          </div>

          {/* Review Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Details</h2>
            {selectedOption ? (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">{selectedOption.title}</h3>
                  <div className="p-4 bg-gray-50 rounded border text-sm">
                    {selectedOption.content}
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => selectedArtifact && approveOutline(selectedArtifact.id, selectedOption.id)}
                    disabled={isApproving}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isApproving ? 'Approving...' : 'Approve This Option'}
                  </button>
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select an option to review</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}