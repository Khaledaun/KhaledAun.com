'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@khaledaun/auth';

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
  type: 'expiring_media' | 'seo_failure' | 'overdue_lead';
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
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  useEffect(() => {
    // Initialize Supabase client
    const client = createBrowserClient();
    setSupabaseClient(client);
    
    // Load initial data
    loadInitialData(client);
    
    // Set up realtime subscriptions if client is available
    if (client) {
      setupRealtimeSubscriptions(client);
    }
    
    return () => {
      // Cleanup subscriptions
      if (client) {
        client.removeAllChannels();
      }
    };
  }, []);

  const loadInitialData = async (client: any) => {
    try {
      // Load leads data
      if (client) {
        const { data: leadsData, error: leadsError } = await client
          .from('leads')
          .select('*')
          .order('createdAt', { ascending: false })
          .limit(10);

        if (leadsError) {
          console.error('Error loading leads:', leadsError);
          // Use stub data for now
          setLeads([
            { id: '1', email: 'test@example.com', name: 'Test User', status: 'NEW', createdAt: new Date().toISOString() }
          ]);
          setLeadCount(1);
        } else {
          setLeads(leadsData || []);
          setLeadCount(leadsData?.length || 0);
        }
      } else {
        // Use stub data when no client
        setLeads([
          { id: '1', email: 'test@example.com', name: 'Test User', status: 'NEW', createdAt: new Date().toISOString() },
          { id: '2', email: 'demo@example.com', name: 'Demo User', status: 'CONTACTED', createdAt: new Date(Date.now() - 300000).toISOString() }
        ]);
        setLeadCount(2);
      }

      // Load job runs (stub data for now)
      setJobRuns([
        { id: '1', status: 'RUNNING', createdAt: new Date().toISOString() },
        { id: '2', status: 'COMPLETED', createdAt: new Date(Date.now() - 300000).toISOString() },
      ]);

      // Load AI artifacts (stub data for now)
      setAiArtifacts([
        { id: '1', type: 'outline_options', status: 'PENDING', createdAt: new Date().toISOString() },
        { id: '2', type: 'facts', status: 'APPROVED', createdAt: new Date(Date.now() - 600000).toISOString() },
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

  const setupRealtimeSubscriptions = (client: any) => {
    if (!client) return;
    
    // Subscribe to leads table changes
    const leadsChannel = client
      .channel('leads_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' },
        (payload: any) => {
          console.log('Leads change received:', payload);
          if (payload.eventType === 'INSERT') {
            setLeads(prev => [payload.new as Lead, ...prev.slice(0, 9)]);
            setLeadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    // Subscribe to job_runs table changes  
    const jobRunsChannel = client
      .channel('job_runs_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'job_runs' },
        (payload: any) => {
          console.log('Job runs change received:', payload);
          if (payload.eventType === 'INSERT') {
            setJobRuns(prev => [payload.new as JobRun, ...prev.slice(0, 9)]);
          }
        }
      )
      .subscribe();

    // Subscribe to ai_artifacts table changes
    const aiArtifactsChannel = client
      .channel('ai_artifacts_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ai_artifacts' },
        (payload: any) => {
          console.log('AI artifacts change received:', payload);
          if (payload.eventType === 'INSERT') {
            setAiArtifacts(prev => [payload.new as AIArtifact, ...prev.slice(0, 9)]);
          }
        }
      )
      .subscribe();
  };

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
            <div className="text-3xl font-bold text-blue-600">{leadCount}</div>
            <div className="text-sm text-gray-500">Total Leads</div>
          </div>
          <div className="space-y-2">
            {leads.map((lead) => (
              <div key={lead.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{lead.name || lead.email}</div>
                  <div className="text-sm text-gray-500">{lead.status}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(lead.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Ops Feed */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Ops Feed</h2>
          <div className="space-y-3">
            {jobRuns.map((job) => (
              <div key={job.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Job Run #{job.id}</div>
                  <div className={`text-sm ${job.status === 'RUNNING' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {job.status}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(job.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {aiArtifacts.map((artifact) => (
              <div key={artifact.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">AI Artifact: {artifact.type}</div>
                  <div className={`text-sm ${artifact.status === 'PENDING' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {artifact.status}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(artifact.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-white rounded-lg shadow p-6 col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Action Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionItems.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-lg border-l-4 ${
                  item.priority === 'high' ? 'border-red-500 bg-red-50' :
                  item.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}
              >
                <div className="font-medium capitalize">{item.type.replace('_', ' ')}</div>
                <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                <div className={`text-xs mt-2 font-medium ${
                  item.priority === 'high' ? 'text-red-600' :
                  item.priority === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {item.priority.toUpperCase()} PRIORITY
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}