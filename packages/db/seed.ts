// Database seeding script for KhaledAun.com
// This script creates sample data for testing HITL workflows

async function main() {
  console.log('Starting database seed...');
  
  // Mock data creation - in a real scenario, this would use Prisma Client
  console.log('Creating sample AIArtifact records...');
  
  const sampleArtifacts = [
    {
      type: 'outline_options',
      postId: 'post-123',  
      content: {
        options: [
          {
            id: 'opt-1',
            title: 'Complete Guide to React Hooks',
            sections: [
              'Introduction to React Hooks',
              'useState Hook Fundamentals',
              'useEffect Hook Deep Dive', 
              'Custom Hooks Development'
            ],
            estimatedWordCount: 3500
          }
        ]
      },
      status: 'PENDING'
    },
    {
      type: 'facts',
      postId: 'post-123',
      content: {
        facts: [
          {
            id: 'fact-1',
            statement: 'React Hooks were introduced in React 16.8.0',
            source: 'https://reactjs.org/blog/2019/02/06/react-v16.8.0.html',
            confidence: 95,
            category: 'historical'
          }
        ]
      },
      status: 'PENDING'
    },
    {
      type: 'outline_final',
      postId: 'post-456',
      content: {
        title: 'Advanced JavaScript Patterns',
        sections: ['Module Pattern', 'Observer Pattern', 'Factory Pattern']
      },
      status: 'APPROVED'
    }
  ];

  console.log(`Mock: Created ${sampleArtifacts.length} AI artifacts`);
  
  // Mock job runs
  const sampleJobRuns = [
    {
      type: 'content_generation',
      status: 'RUNNING'
    },
    {
      type: 'seo_analysis', 
      status: 'COMPLETED'
    }
  ];
  
  console.log(`Mock: Created ${sampleJobRuns.length} job runs`);

  // Mock leads
  const sampleLeads = [
    {
      email: 'john@example.com',
      name: 'John Doe',
      status: 'NEW'
    },
    {
      email: 'jane@example.com', 
      name: 'Jane Smith',
      status: 'CONTACTED'
    }
  ];
  
  console.log(`Mock: Created ${sampleLeads.length} leads`);
  
  console.log('Database seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
