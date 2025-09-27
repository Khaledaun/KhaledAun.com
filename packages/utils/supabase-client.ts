import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase client not configured properly. Check your .env file.');
    // Return a mock client so the app doesn't crash
    return {
      from: () => ({
        on: () => ({ subscribe: () => {} }),
        select: () => ({ data: [], error: { message: 'Mock client' } }),
      }),
    };
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

const supabase = createSupabaseBrowserClient();

export default supabase;
