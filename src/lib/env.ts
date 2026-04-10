/**
 * Validated environment variables.
 *
 * Parsed once on first access via a lazy getter. Throws at startup if
 * required vars are missing, so we never hit a cryptic runtime error later.
 *
 * NEXT_PUBLIC_* vars used in client components are NOT included here because
 * Next.js statically replaces them at build time. NODE_ENV is also excluded
 * for the same reason. This module is server-only.
 */

import { z } from "zod";

const serverSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_CA_CERT: z.string().optional(),

  // Supabase (server-side usage only; client-side must use process.env directly)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional().default("http://localhost:3000"),

  // Encryption (dynamic version access handled separately in encryption.ts)
  ENCRYPTION_KEY: z.string().length(64, "ENCRYPTION_KEY must be 64 hex characters"),

  // AI
  GROQ_API_KEY: z.string().optional(),

  // Cron
  CRON_SECRET: z.string().optional(),

  // SMTP (all-or-nothing: if SMTP_HOST is set, user/pass are required)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional().default("BalanceVisor <alerts@localhost>"),

  // TrueLayer
  TRUELAYER_CLIENT_ID: z.string().optional(),
  TRUELAYER_CLIENT_SECRET: z.string().optional(),
  TRUELAYER_SANDBOX: z
    .enum(["true", "false"])
    .optional()
    .default("true")
    .transform((v) => v === "true"),

  // PostHog
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let _env: ServerEnv | undefined;

/**
 * Lazily parsed and cached server environment.
 * Throws a descriptive ZodError on first access if required vars are missing.
 */
export function env(): ServerEnv {
  if (!_env) {
    _env = serverSchema.parse(process.env);
  }
  return _env;
}
