import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

// Only initialize if we have proper credentials
if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'https://placeholder.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn('Supabase server client not initialized - using mock');
}

// Initialize Supabase client for client-side use (browser)
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('Supabase client not configured properly - using mock client');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

export interface UserWithRole {
  id: string;
  email?: string;
  role: string;
}

/**
 * Server-side utility to require admin authentication
 * Validates JWT token and extracts user role
 * Throws 401 if no valid token, 403 if not admin
 */
export async function requireAdmin(authHeader?: string | null): Promise<UserWithRole> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    if (!supabase) {
      // Mock response for testing
      console.warn('Using mock admin validation');
      return {
        id: 'mock-admin-id',
        email: 'admin@example.com',
        role: 'admin',
      };
    }

    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('INVALID_TOKEN');
    }

    // Extract role from user metadata
    const role = user.user_metadata?.role || user.app_metadata?.role || 'user';
    
    if (role !== 'admin') {
      throw new Error('FORBIDDEN');
    }

    return {
      id: user.id,
      email: user.email,
      role: role,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'FORBIDDEN') {
        throw new Error('FORBIDDEN');
      }
    }
    throw new Error('UNAUTHORIZED');
  }
}

/**
 * Extract user info from JWT without role restriction
 * Returns null if token is invalid
 */
export async function getUser(authHeader?: string | null): Promise<UserWithRole | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    if (!supabase) {
      // Mock response for testing
      console.warn('Using mock user validation');
      return {
        id: 'mock-user-id',
        email: 'user@example.com',
        role: 'ops',
      };
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    const role = user.user_metadata?.role || user.app_metadata?.role || 'user';
    
    return {
      id: user.id,
      email: user.email,
      role: role,
    };
  } catch {
    return null;
  }
}

export { supabase };