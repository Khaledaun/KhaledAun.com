import { z } from 'zod';

export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Site configuration
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  
  // Supabase Auth
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

// This is a placeholder for server-side validation
console.log('Environment schema loaded.');
