import { z } from 'zod';

/**
 * Validate environment at module load. A missing/invalid required value should
 * fail the build, not a request at 2am. Optional keys are typed optional; a
 * feature flag that is on without its keys is asserted server-side (see below).
 *
 * NEXT_PUBLIC_* vars are referenced literally so Next can inline them client-side.
 */
const flag = z
  .enum(['true', 'false'])
  .catch('false')
  .transform((v) => v === 'true');

const raw = {
  NEXT_PUBLIC_FEATURE_CHAT: process.env.NEXT_PUBLIC_FEATURE_CHAT,
  NEXT_PUBLIC_FEATURE_TICKETS: process.env.NEXT_PUBLIC_FEATURE_TICKETS,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  IP_HASH_SALT: process.env.IP_HASH_SALT,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  EMBEDDING_API_KEY: process.env.EMBEDDING_API_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
};

const schema = z.object({
  NEXT_PUBLIC_FEATURE_CHAT: flag,
  NEXT_PUBLIC_FEATURE_TICKETS: flag,
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  IP_HASH_SALT: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  EMBEDDING_API_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

export const env = schema.parse(raw);

export const features = {
  chat: env.NEXT_PUBLIC_FEATURE_CHAT,
  tickets: env.NEXT_PUBLIC_FEATURE_TICKETS,
} as const;
