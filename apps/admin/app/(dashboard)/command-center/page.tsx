'use client';

import { useState, useEffect } from 'react';

// Types for our data
interface Lead {
  id: string;
  email: string;
  name?: string;
  status: string;
  createdAt: string;
}

interface JobRun {
  id: string;
  status: string;
  createdAt: string;
}

interface AIArtifact {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

interface ActionItem {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export default function CommandCenter() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadCount, setLeadCount] = useState(0);
  const [jobRuns, setJobRuns] = useState<JobRun[]>([]);
  const [aiArtifacts, setAiArtifacts] = useState<AIArtifact[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load leads (stub data for now)
        setLeads([
          { id: '1', email: 'john@example.com', name: 'John Doe', status: 'new', createdAt: '2024-01-01' },
          { id: '2', email: 'jane@example.com', name: 'Jane Smith', status: 'contacted', createdAt: '2024-01-02' },
        ]);

        // Load job runs (stub data for now)
        setJobRuns([
          { id: '1', status: 'completed', createdAt: '2024-01-01' },
          { id: '2', status: 'running', createdAt: '2024-01-02' },
        ]);

        // Load AI artifacts (stub data for now)
        setAiArtifacts([
          { id: '1', type: 'outline', status: 'pending', createdAt: '2024-01-01' },
          { id: '2', type: 'facts', status: 'approved', createdAt: '2024-01-02' },
        ]);

        // Load action items (stub data for now)
        setActionItems([
          { id: '1', description: 'Media license expires in 3 days', priority: 'high' },
          { id: '2', description: 'SEO check failed for /blog/post-1', priority: 'medium' },
          { id: '3', description: 'Lead follow-up overdue by 2 days', priority: 'low' },
        ]);

      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Command Center</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Command Center</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Funnel</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Total Leads: {leads.length}</p>
          </div>
          <div className="space-y-2">
            {leads.map((lead) => (
              <div key={lead.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{lead.name || lead.email}</div>
                  <div className="text-sm text-gray-500">{lead.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Runs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Job Runs</h2>
          <div className="space-y-2">
            {jobRuns.map((job) => (
              <div key={job.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Job Run #{job.id}</div>
                  <div className="text-sm text-gray-500">{job.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Action Items</h2>
          <div className="space-y-2">
            {actionItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{item.description}</div>
                  <div className={`text-sm ${
                    item.priority === 'high' ? 'text-red-600' : 
                    item.priority === 'medium' ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    Priority: {item.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}