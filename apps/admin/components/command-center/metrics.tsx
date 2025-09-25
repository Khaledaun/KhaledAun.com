'use client'

interface MetricsData {
  totalIdeas: number
  pendingOutlines: number
  pendingFacts: number
  publishedPosts: number
  totalLeads: number
  mediaFiles: number
}

interface CommandCenterMetricsProps {
  data?: MetricsData
}

export function CommandCenterMetrics({ data }: CommandCenterMetricsProps) {
  const metrics = data || {
    totalIdeas: 0,
    pendingOutlines: 0,
    pendingFacts: 0,
    publishedPosts: 0,
    totalLeads: 0,
    mediaFiles: 0,
  }

  const metricCards = [
    {
      title: 'Total Ideas',
      value: metrics.totalIdeas,
      change: '+12%',
      changeType: 'positive',
      icon: '💡',
    },
    {
      title: 'Pending Outlines',
      value: metrics.pendingOutlines,
      change: '-5%',
      changeType: 'negative',
      icon: '📝',
      urgent: metrics.pendingOutlines > 10,
    },
    {
      title: 'Pending Facts',
      value: metrics.pendingFacts,
      change: '+3%',
      changeType: 'positive',
      icon: '🔍',
      urgent: metrics.pendingFacts > 15,
    },
    {
      title: 'Published Posts',
      value: metrics.publishedPosts,
      change: '+8%',
      changeType: 'positive',
      icon: '📚',
    },
    {
      title: 'Total Leads',
      value: metrics.totalLeads,
      change: '+15%',
      changeType: 'positive',
      icon: '👥',
    },
    {
      title: 'Media Files',
      value: metrics.mediaFiles,
      change: '+22%',
      changeType: 'positive',
      icon: '🖼️',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map((metric, index) => (
        <div
          key={index}
          className={`bg-white overflow-hidden shadow rounded-lg ${
            metric.urgent ? 'ring-2 ring-orange-500' : ''
          }`}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{metric.icon}</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {metric.title}
                    {metric.urgent && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Needs Attention
                      </span>
                    )}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {metric.value.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span
                className={`font-medium ${
                  metric.changeType === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {metric.change}
              </span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}