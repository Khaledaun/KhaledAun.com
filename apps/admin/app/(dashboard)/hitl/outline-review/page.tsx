'use client';

import { useState, useEffect } from 'react';

interface AIArtifact {
  id: string;
  type: string;

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
    } finally {
      setIsLoading(false);
    }
  };


  const approveOutline = async (artifactId: string, selectedOptionId: string) => {
    if (!selectedOption) return;

    setIsApproving(true);
    try {

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

        </div>
      )}
    </div>
  );

