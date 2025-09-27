import { createClient } from '@supabase/supabase-js';

// --- Diagnostic Code ---
console.log('--- Checking Environment Variables ---');
console.log('Checking Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Checking Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('------------------------------------');
// --- End Diagnostic Code ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Key is missing.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
