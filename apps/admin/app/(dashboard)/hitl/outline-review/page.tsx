'use client';

import { useState, useEffect } from 'react';

interface AIArtifact {
  id: string;
  type: string;
  content: any;
  status: string;
  createdAt: string;
}

interface OutlineOption {
  id: string;
  title: string;
  structure: string[];
  summary: string;
}

export default function OutlineReview() {
  const [artifacts, setArtifacts] = useState<AIArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<AIArtifact | null>(null);
  const [selectedOption, setSelectedOption] = useState<OutlineOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = async () => {
    try {
      // Mock data for testing
      const mockArtifacts: AIArtifact[] = [
        {
          id: '1',
          type: 'outline_options',
          content: {
            options: [
              {
                id: 'opt1',
                title: 'Technical Deep Dive',
                structure: ['Introduction', 'Technical Overview', 'Implementation', 'Conclusion'],
                summary: 'A comprehensive technical analysis'
              },
              {
                id: 'opt2',
                title: 'Beginner-Friendly Guide',
                structure: ['What is it?', 'Why it matters', 'Getting Started', 'Next Steps'],
                summary: 'An accessible introduction for newcomers'
              }
            ]
          },
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }
      ];
      
      setArtifacts(mockArtifacts);
    } catch (error) {
      console.error('Error loading artifacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMockOutlineOptions = (): OutlineOption[] => {
    if (!selectedArtifact?.content?.options) return [];
    return selectedArtifact.content.options;
  };

  const approveOutline = async (artifactId: string, selectedOptionId: string) => {
    if (!selectedOption) return;

    setIsApproving(true);
    try {
      // Mock approval for testing
      console.log('Mock: Approved outline option', selectedOptionId, 'for artifact', artifactId);

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
        <div className="text-center text-gray-600">
          <p>No pending outline reviews at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {artifacts.map((artifact) => (
            <div key={artifact.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Outline Options for Artifact #{artifact.id}
                  </h2>
                  <p className="text-gray-600">Created: {new Date(artifact.createdAt).toLocaleString()}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {artifact.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getMockOutlineOptions().map((option) => (
                  <div
                    key={option.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedOption?.id === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedOption(option)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{option.summary}</p>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Structure:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {option.structure.map((section, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            {section}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOption && (
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setSelectedOption(null);
                      setSelectedArtifact(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => approveOutline(artifact.id, selectedOption.id)}
                    disabled={isApproving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isApproving ? 'Approving...' : 'Approve Outline'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
