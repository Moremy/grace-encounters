// Validates process.env at boot. Safe to import from server and client trees:
// client imports only see the public schema.
import { z } from 'zod';

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_ID: z.string().uuid().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const publicSchema = serverSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_SITE_URL: true,
});

type ServerEnv = z.infer<typeof serverSchema>;
type PublicEnv = z.infer<typeof publicSchema>;

function parseEnv(): ServerEnv | PublicEnv {
  const isServer = typeof window === 'undefined';
  const schema = isServer ? serverSchema : publicSchema;
  const source = isServer
    ? process.env
    : {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      };
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    console.error(
      '[env] Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    );
    throw new Error('Invalid environment variables. See .env.example.');
  }
  return parsed.data;
}

export const env = parseEnv();
