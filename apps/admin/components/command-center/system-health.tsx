'use client'

import { useState, useEffect } from 'react'

interface SystemHealthData {
  database: boolean
  storage: boolean
  ai: boolean
  email: boolean
}

interface SystemHealthProps {
  data?: SystemHealthData
}

interface HealthCheck {
  name: string
  status: boolean
  lastCheck: string
  responseTime?: number
  details?: string
}

export function SystemHealth({ data }: SystemHealthProps) {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    runHealthChecks()
    const interval = setInterval(runHealthChecks, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const runHealthChecks = async () => {
    try {
      // Run individual health checks
      const checks = await Promise.allSettled([
        checkDatabase(),
        checkStorage(),
        checkAI(),
        checkEmail(),
        checkAPI(),
        checkCDN(),
      ])

      const healthResults: HealthCheck[] = [
        {
          name: 'Database',
          status: checks[0].status === 'fulfilled' ? checks[0].value : false,
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 100 + 20, // Mock response time
          details: checks[0].status === 'fulfilled' ? 'PostgreSQL connection active' : 'Database connection failed'
        },
        {
          name: 'Storage',
          status: checks[1].status === 'fulfilled' ? checks[1].value : false,
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 200 + 50,
          details: checks[1].status === 'fulfilled' ? 'All storage providers operational' : 'Storage issues detected'
        },
        {
          name: 'AI Services',
          status: checks[2].status === 'fulfilled' ? checks[2].value : false,
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 1000 + 200,
          details: checks[2].status === 'fulfilled' ? 'OpenAI API responding' : 'AI service unavailable'
        },
        {
          name: 'Email',
          status: checks[3].status === 'fulfilled' ? checks[3].value : false,
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 300 + 100,
          details: checks[3].status === 'fulfilled' ? 'SMTP server operational' : 'Email service down'
        },
        {
          name: 'API',
          status: checks[4].status === 'fulfilled' ? checks[4].value : false,
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 50 + 10,
          details: checks[4].status === 'fulfilled' ? 'All endpoints responding' : 'API issues detected'
        },
        {
          name: 'CDN',
          status: checks[5].status === 'fulfilled' ? checks[5].value : false,
          lastCheck: new Date().toISOString(),
          responseTime: Math.random() * 30 + 5,
          details: checks[5].status === 'fulfilled' ? 'Content delivery optimal' : 'CDN performance issues'
        },
      ]

      setHealthChecks(healthResults)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock health check functions
  const checkDatabase = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return Math.random() > 0.1 // 90% success rate
  }

  const checkStorage = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 150))
    return Math.random() > 0.05 // 95% success rate
  }

  const checkAI = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return Math.random() > 0.15 // 85% success rate
  }

  const checkEmail = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return Math.random() > 0.1 // 90% success rate
  }

  const checkAPI = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 50))
    return Math.random() > 0.05 // 95% success rate
  }

  const checkCDN = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 30))
    return Math.random() > 0.02 // 98% success rate
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌'
  }

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return 'text-green-600'
    if (time < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const overallHealth = healthChecks.length > 0 
    ? (healthChecks.filter(check => check.status).length / healthChecks.length) * 100
    : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">System Health</h3>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${overallHealth >= 95 ? 'text-green-600' : overallHealth >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
              {Math.round(overallHealth)}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Overall Health</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-green-600 font-bold">
              {healthChecks.filter(check => check.status).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Services Online</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-red-600 font-bold">
              {healthChecks.filter(check => !check.status).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Services Down</p>
          </div>
        </div>

        <button
          onClick={runHealthChecks}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Run Health Check
        </button>
      </div>

      {/* Individual Service Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">Service Status</h4>
        </div>

        <div className="divide-y divide-gray-200">
          {healthChecks.map((check, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getStatusIcon(check.status)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {check.name}
                    </p>
                    <p className="text-xs text-gray-500">{check.details}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className={`font-medium ${getStatusColor(check.status)}`}>
                      {check.status ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  {check.responseTime && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Response Time</p>
                      <p className={`font-medium ${getResponseTimeColor(check.responseTime)}`}>
                        {Math.round(check.responseTime)}ms
                      </p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Last Check</p>
                    <p className="font-medium text-gray-900">
                      {new Date(check.lastCheck).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
            <span className="mr-2">🔄</span>
            <span className="text-sm">Restart Services</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
            <span className="mr-2">📊</span>
            <span className="text-sm">View Logs</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
            <span className="mr-2">⚙️</span>
            <span className="text-sm">System Config</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
            <span className="mr-2">📧</span>
            <span className="text-sm">Alert Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}