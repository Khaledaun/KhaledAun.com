'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@khaledaun/auth';

interface Fact {
  id: string;
  statement: string;
  source: string;
  confidence: number;
  category: string;
}

interface AIArtifact {
  id: string;
  type: string;
  content: {
    facts?: Fact[];
    postId?: string;
    metadata?: any;
  };
  status: string;
  createdAt: string;
}

export default function FactsReview() {
  const [artifacts, setArtifacts] = useState<AIArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<AIArtifact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    loadFactsForReview();
  }, []);

  const loadFactsForReview = async () => {
    try {
      const client = createBrowserClient();
      
      if (client) {
        const { data, error } = await client
          .from('ai_artifacts')
          .select('*')
          .eq('type', 'facts')
          .eq('status', 'PENDING')
          .order('createdAt', { ascending: false });

        if (error) {
          console.error('Error loading facts:', error);
          setArtifacts(getMockFacts());
        } else {
          setArtifacts(data || []);
        }
      } else {
        // Use mock data when Supabase client is not available
        setArtifacts(getMockFacts());
      }
    } catch (error) {
      console.error('Error loading facts:', error);
      setArtifacts(getMockFacts());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockFacts = (): AIArtifact[] => [
    {
      id: '1',
      type: 'facts',
      content: {
        postId: 'post-123',
        facts: [
          {
            id: 'fact-1',
            statement: 'React Hooks were introduced in React 16.8.0, released in February 2019.',
            source: 'https://reactjs.org/blog/2019/02/06/react-v16.8.0.html',
            confidence: 95,
            category: 'historical'
          },
          {
            id: 'fact-2',
            statement: 'useState is the fundamental Hook for managing state in functional components.',
            source: 'https://reactjs.org/docs/hooks-state.html',
            confidence: 98,
            category: 'technical'
          },
          {
            id: 'fact-3',
            statement: 'useEffect combines componentDidMount, componentDidUpdate, and componentWillUnmount lifecycle methods.',
            source: 'https://reactjs.org/docs/hooks-effect.html',
            confidence: 92,
            category: 'technical'
          },
          {
            id: 'fact-4',
            statement: 'Custom Hooks must start with "use" prefix to follow React conventions.',
            source: 'https://reactjs.org/docs/hooks-custom.html',
            confidence: 100,
            category: 'best-practice'
          },
          {
            id: 'fact-5',
            statement: 'React Hooks cannot be called inside loops, conditions, or nested functions.',
            source: 'https://reactjs.org/docs/hooks-rules.html',
            confidence: 100,
            category: 'rule'
          },
          {
            id: 'fact-6',
            statement: 'useCallback and useMemo are performance optimization hooks that should be used judiciously.',
            source: 'https://reactjs.org/docs/hooks-reference.html#usecallback',
            confidence: 88,
            category: 'performance'
          }
        ]
      },
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
  ];

  const approveFacts = async (artifactId: string) => {
    setIsApproving(true);
    try {
      const client = createBrowserClient();
      
      if (client) {
        // Update the artifact status to APPROVED
        const { error } = await client
          .from('ai_artifacts')
          .update({ 
            status: 'APPROVED',
            approvedAt: new Date().toISOString()
          })
          .eq('id', artifactId);

        if (error) {
          console.error('Error approving facts:', error);
          alert('Error approving facts. Please try again.');
          return;
        }
      } else {
        // Mock approval for demo
        console.log('Mock: Approved facts for artifact', artifactId);
      }

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

  const rejectFacts = async (artifactId: string) => {
    setIsApproving(true);
    try {
      const client = createBrowserClient();
      
      if (client) {
        // Update the artifact status to REJECTED
        const { error } = await client
          .from('ai_artifacts')
          .update({ 
            status: 'REJECTED',
            rejectedAt: new Date().toISOString()
          })
          .eq('id', artifactId);

        if (error) {
          console.error('Error rejecting facts:', error);
          alert('Error rejecting facts. Please try again.');
          return;
        }
      } else {
        // Mock rejection for demo
        console.log('Mock: Rejected facts for artifact', artifactId);
      }

      // Remove from pending list
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
      setSelectedArtifact(null);
      
      alert('Facts rejected. The content will need to be regenerated.');
    } catch (error) {
      console.error('Error rejecting facts:', error);
      alert('Error rejecting facts. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'historical': 'bg-blue-100 text-blue-800',
      'technical': 'bg-purple-100 text-purple-800',
      'best-practice': 'bg-green-100 text-green-800',
      'rule': 'bg-red-100 text-red-800',
      'performance': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pending Fact Reviews</h2>
          <p className="text-gray-600">All facts have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artifact List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Reviews</h2>
            <div className="space-y-4">
              {artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  onClick={() => setSelectedArtifact(artifact)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedArtifact?.id === artifact.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Post ID: {artifact.content.postId}</div>
                  <div className="text-sm text-gray-500">
                    {artifact.content.facts?.length} facts to review
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(artifact.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Facts Details */}
          <div className="lg:col-span-2">
            {selectedArtifact ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Review Facts for Post {selectedArtifact.content.postId}
                </h2>
                
                <div className="space-y-4">
                  {selectedArtifact.content.facts?.map((fact) => (
                    <div key={fact.id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(fact.category)}`}>
                            {fact.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(fact.confidence)}`}>
                            {fact.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-900 mb-4 text-sm leading-relaxed">
                        {fact.statement}
                      </p>
                      
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Source:</span>{' '}
                          <a
                            href={fact.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {fact.source}
                          </a>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => rejectFacts(selectedArtifact.id)}
                    disabled={isApproving}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isApproving ? 'Processing...' : 'Reject Facts'}
                  </button>
                  <button
                    onClick={() => approveFacts(selectedArtifact.id)}
                    disabled={isApproving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isApproving ? 'Processing...' : 'Approve All Facts'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select an Artifact</h2>
                <p className="text-gray-600">Choose an artifact from the left to review facts.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}