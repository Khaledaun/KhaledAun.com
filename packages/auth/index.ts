import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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