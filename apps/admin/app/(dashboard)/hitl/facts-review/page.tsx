'use client';

import { useState, useEffect } from 'react';

interface AIArtifact {
  id: string;
  type: string;
  content: any;
  status: string;
  createdAt: string;
}

interface Fact {
  id: string;
  statement: string;
  source: string;
  verified: boolean;
}

export default function FactsReview() {
  const [artifacts, setArtifacts] = useState<AIArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<AIArtifact | null>(null);
  const [approvedFacts, setApprovedFacts] = useState<Set<string>>(new Set());
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
          type: 'facts',
          content: {
            facts: [
              {
                id: 'fact1',
                statement: 'The average person spends 2.5 hours daily on social media.',
                source: 'Pew Research Center, 2023',
                verified: true
              },
              {
                id: 'fact2',
                statement: 'Content marketing generates 3x more leads than traditional marketing.',
                source: 'HubSpot, 2023',
                verified: true
              },
              {
                id: 'fact3',
                statement: 'Video content is 50x more likely to drive organic results than text.',
                source: 'Forrester Research, 2023',
                verified: false
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

  const getMockFacts = (): Fact[] => {
    if (!selectedArtifact?.content?.facts) return [];
    return selectedArtifact.content.facts;
  };

  const toggleFactApproval = (factId: string) => {
    setApprovedFacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(factId)) {
        newSet.delete(factId);
      } else {
        newSet.add(factId);
      }
      return newSet;
    });
  };

  const approveFacts = async (artifactId: string) => {
    if (approvedFacts.size === 0) {
      alert('Please select at least one fact to approve.');
      return;
    }

    setIsApproving(true);
    try {
      // Mock approval for testing
      console.log('Mock: Approved facts', Array.from(approvedFacts), 'for artifact', artifactId);

      // Remove from pending list
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
      setSelectedArtifact(null);
      setApprovedFacts(new Set());
      
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
        <div className="text-center text-gray-600">
          <p>No pending facts reviews at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {artifacts.map((artifact) => (
            <div key={artifact.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Facts for Artifact #{artifact.id}
                  </h2>
                  <p className="text-gray-600">Created: {new Date(artifact.createdAt).toLocaleString()}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {artifact.status}
                </span>
              </div>

              <div className="space-y-4">
                {getMockFacts().map((fact) => (
                  <div
                    key={fact.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      approvedFacts.has(fact.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={approvedFacts.has(fact.id)}
                        onChange={() => toggleFactApproval(fact.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 mb-2">{fact.statement}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Source: {fact.source}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            fact.verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {fact.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {approvedFacts.size} of {getMockFacts().length} facts selected
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      setApprovedFacts(new Set());
                      setSelectedArtifact(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => approveFacts(artifact.id)}
                    disabled={isApproving || approvedFacts.size === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isApproving ? 'Approving...' : 'Approve Selected Facts'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
