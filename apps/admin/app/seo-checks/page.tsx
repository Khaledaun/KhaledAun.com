'use client';

import { useState, useEffect } from 'react';

interface SEOCheck {
  id: string;
  url: string;
  title: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  issues: string[];
}

export default function SEOChecksPage() {
  const [seoChecks, setSeoChecks] = useState<SEOCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock SEO checks data
    const mockChecks: SEOCheck[] = [
      {
        id: '1',
        url: '/blog/post-1',
        title: 'How to Build a Modern Web App',
        description: 'Learn how to build a modern web application using React and Next.js',
        status: 'PASS',
        issues: [],
      },
      {
        id: '2',
        url: '/blog/post-2',
        title: 'SEO Best Practices',
        description: 'A comprehensive guide to SEO best practices for modern websites',
        status: 'WARNING',
        issues: ['Title too long', 'Missing meta keywords'],
      },
      {
        id: '3',
        url: '/blog/post-3',
        title: 'Post 3',
        description: 'Short description',
        status: 'FAIL',
        issues: ['Title too short', 'Description too short', 'Missing meta description'],
      },
    ];

    setSeoChecks(mockChecks);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAIL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">SEO Checks</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">SEO Checks</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">SEO Analysis Results</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {seoChecks.map((check) => (
            <div key={check.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{check.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{check.url}</p>
                  <p className="text-sm text-gray-500 mt-2">{check.description}</p>
                  
                  {check.issues.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Issues:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {check.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(check.status)}`}>
                    {check.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
