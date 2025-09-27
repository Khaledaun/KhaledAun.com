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
  type: string;
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
    // Load initial data
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load leads data (stub data for now)
      setLeads([
        { id: '1', email: 'test@example.com', name: 'Test User', status: 'NEW', createdAt: new Date().toISOString() },
        { id: '2', email: 'demo@example.com', name: 'Demo User', status: 'CONTACTED', createdAt: new Date().toISOString() }
      ]);
      setLeadCount(2);

      // Load job runs (stub data)
      setJobRuns([
        { id: '1', status: 'COMPLETED', createdAt: new Date().toISOString() },
        { id: '2', status: 'RUNNING', createdAt: new Date().toISOString() }
      ]);

      // Load AI artifacts (stub data)
      setAiArtifacts([
        { id: '1', type: 'outline_options', status: 'PENDING', createdAt: new Date().toISOString() },
        { id: '2', type: 'facts', status: 'APPROVED', createdAt: new Date().toISOString() }
      ]);

      // Load action items (stub data for now)
      setActionItems([
        { id: '1', type: 'expiring_media', description: 'Media license expires in 3 days', priority: 'high' },
        { id: '2', type: 'seo_failure', description: 'SEO check failed for /blog/post-1', priority: 'medium' },
        { id: '3', type: 'overdue_lead', description: 'Lead follow-up overdue by 2 days', priority: 'low' },
      ]);

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Command Center</h1>
        <h2>Action Center</h2>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Command Center</h1>
      <h2>Action Center</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Funnel</h2>
          <div className="mb-4">
            <span className="text-2xl font-bold text-blue-600">{leadCount}</span>
            <span className="text-gray-600 ml-2">Total Leads</span>
          </div>
          <div className="space-y-2">
            {leads.map((lead) => (
              <div key={lead.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{lead.name || lead.email}</div>
                  <div className="text-sm text-gray-600">{lead.email}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  lead.status === 'NEW' ? 'bg-green-100 text-green-800' :
                  lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Pipeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Pipeline</h2>
          <div className="space-y-2">
            {jobRuns.map((job) => (
              <div key={job.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Job Run #{job.id}</div>
                  <div className="text-sm text-gray-600">{job.createdAt}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  job.status === 'RUNNING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Ops Feed */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Ops Feed</h2>
          <div className="space-y-2">
            {aiArtifacts.map((artifact) => (
              <div key={artifact.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{artifact.type}</div>
                  <div className="text-sm text-gray-600">{artifact.createdAt}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  artifact.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  artifact.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {artifact.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Action Center</h2>
          <div className="space-y-2">
            {actionItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{item.description}</div>
                  <div className="text-sm text-gray-600">{item.type}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
