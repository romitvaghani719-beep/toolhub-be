import { z } from "zod";

const envSchema = z.object({
  SUPABASE_POOLER_URL: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  BE_URL: z.string().url().default("http://localhost:3001"),
  FE_URL: z.string().min(1).default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
      throw new Error(`Missing or invalid environment variables: ${missing}`);
    }
    cached = parsed.data;
  }
  return cached;
}

/** Comma-separated FE_URL → list of allowed browser origins */
export function getAllowedOrigins(): string[] {
  return getEnv()
    .FE_URL.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}
