import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

// This is a placeholder for server-side validation
console.log('Environment schema loaded.');
