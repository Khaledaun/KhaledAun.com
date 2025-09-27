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

          </div>
          <div className="space-y-2">
            {leads.map((lead) => (
              <div key={lead.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{lead.name || lead.email}</div>

              </div>
            ))}
          </div>
        </div>


            {jobRuns.map((job) => (
              <div key={job.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Job Run #{job.id}</div>

              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

