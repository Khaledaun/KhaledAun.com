'use client';

import { useState, useEffect } from 'react';

interface AIArtifact {
  id: string;
  type: string;

  status: string;
  createdAt: string;
}


  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    } finally {
      setIsLoading(false);
    }
  };



      // Remove from pending list
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
      setSelectedArtifact(null);
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

        </div>
      )}
    </div>
  );

