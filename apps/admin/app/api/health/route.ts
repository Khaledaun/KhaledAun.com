import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Health check endpoint for monitoring and load balancers
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
    
    // Check database connectivity
    let dbStatus = 'unknown';
    let dbResponseTime = 0;
    
    try {
      const dbStartTime = Date.now();
      
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Simple query to test database connectivity
        const { data, error } = await supabase
          .from('_health_check')
          .select('*')
          .limit(1);
        
        dbResponseTime = Date.now() - dbStartTime;
        
        if (error) {
          // If the health check table doesn't exist, try a simple query
          const { error: simpleError } = await supabase
            .from('posts')
            .select('id')
            .limit(1);
          
          if (simpleError) {
            dbStatus = 'error';
            health['db_error'] = simpleError.message;
          } else {
            dbStatus = 'healthy';
          }
        } else {
          dbStatus = 'healthy';
        }
      } else {
        dbStatus = 'not_configured';
      }
    } catch (error) {
      dbStatus = 'error';
      health['db_error'] = error instanceof Error ? error.message : 'Unknown database error';
    }
    
    // Check external services
    const services = {
      database: {
        status: dbStatus,
        responseTime: dbResponseTime
      }
    };
    
    // Determine overall health status
    const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded';
    
    const responseTime = Date.now() - startTime;
    
    const healthResponse = {
      ...health,
      status: overallStatus,
      services,
      responseTime
    };
    
    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthResponse, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Simple ping endpoint for basic connectivity checks
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
