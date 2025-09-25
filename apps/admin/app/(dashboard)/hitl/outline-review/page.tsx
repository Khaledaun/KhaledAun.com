'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@khaledaun/auth';

interface OutlineOption {
  id: string;
  title: string;
  sections: string[];
  estimatedWordCount: number;
}

interface AIArtifact {
  id: string;
  type: string;
  content: {
    options?: OutlineOption[];
    postId?: string;
    metadata?: any;
  };
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
    loadOutlineOptions();
  }, []);

  const loadOutlineOptions = async () => {
    try {
      const client = createBrowserClient();
      
      if (client) {
        const { data, error } = await client
          .from('ai_artifacts')
          .select('*')
          .eq('type', 'outline_options')
          .eq('status', 'PENDING')
          .order('createdAt', { ascending: false });

        if (error) {
          console.error('Error loading outline options:', error);
          setArtifacts(getMockOutlineOptions());
        } else {
          setArtifacts(data || []);
        }
      } else {
        // Use mock data when Supabase client is not available
        setArtifacts(getMockOutlineOptions());
      }
    } catch (error) {
      console.error('Error loading outline options:', error);
      setArtifacts(getMockOutlineOptions());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockOutlineOptions = (): AIArtifact[] => [
    {
      id: '1',
      type: 'outline_options',
      content: {
        postId: 'post-123',
        options: [
          {
            id: 'opt-1',
            title: 'Complete Guide to React Hooks',
            sections: [
              'Introduction to React Hooks',
              'useState Hook Fundamentals', 
              'useEffect Hook Deep Dive',
              'Custom Hooks Development',
              'Advanced Hook Patterns',
              'Performance Optimization',
              'Testing Hooks',
              'Best Practices and Common Pitfalls'
            ],
            estimatedWordCount: 3500
          },
          {
            id: 'opt-2', 
            title: 'React Hooks: From Basics to Advanced',
            sections: [
              'Why React Hooks?',
              'Core Hooks Overview',
              'State Management with Hooks',
              'Side Effects and useEffect',
              'Context and useContext',
              'Performance Hooks',
              'Building Custom Hooks',
              'Migration from Class Components'
            ],
            estimatedWordCount: 3200
          },
          {
            id: 'opt-3',
            title: 'Mastering React Hooks in 2024',
            sections: [
              'Modern React Development',
              'Essential Hooks You Must Know',
              'Advanced Hook Techniques',
              'Hooks for State Management',
              'Async Operations with Hooks',
              'Hook Testing Strategies',
              'Real-World Hook Examples',
              'Future of React Hooks'
            ],
            estimatedWordCount: 4000
          }
        ]
      },
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
  ];

  const approveOutline = async (artifactId: string, selectedOptionId: string) => {
    if (!selectedOption) return;

    setIsApproving(true);
    try {
      const client = createBrowserClient();
      
      if (client) {
        // Create a new ai_artifact with type 'outline_final'
        const { error } = await client
          .from('ai_artifacts')
          .insert({
            type: 'outline_final',
            content: selectedOption,
            status: 'APPROVED',
            metadata: {
              originalArtifactId: artifactId,
              selectedOptionId: selectedOptionId,
              approvedAt: new Date().toISOString()
            }
          });

        if (error) {
          console.error('Error creating final outline:', error);
          alert('Error approving outline. Please try again.');
          return;
        }

        // Update the original artifact status to APPROVED
        await client
          .from('ai_artifacts')
          .update({ status: 'APPROVED' })
          .eq('id', artifactId);
      } else {
        // Mock approval for demo
        console.log('Mock: Approved outline option', selectedOptionId, 'for artifact', artifactId);
      }

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
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pending Outlines</h2>
          <p className="text-gray-600">All outline options have been reviewed.</p>
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
                    {artifact.content.options?.length} options available
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(artifact.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outline Options */}
          <div className="lg:col-span-2">
            {selectedArtifact ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Select Outline Option
                </h2>
                
                <div className="space-y-4">
                  {selectedArtifact.content.options?.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedOption(option)}
                      className={`p-6 rounded-lg border cursor-pointer transition-colors ${
                        selectedOption?.id === option.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {option.title}
                      </h3>
                      
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">
                          Estimated word count: {option.estimatedWordCount.toLocaleString()} words
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">Outline:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                          {option.sections.map((section, index) => (
                            <li key={index}>{section}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedOption && (
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedOption(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => approveOutline(selectedArtifact.id, selectedOption.id)}
                      disabled={isApproving}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isApproving ? 'Approving...' : 'Approve Selected Outline'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select an Artifact</h2>
                <p className="text-gray-600">Choose an artifact from the left to review outline options.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}