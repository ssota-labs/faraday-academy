import { createMemoryStore, type PlatformStore } from "@faraday-academy/platform-core";

export type AdapterMode = "memory" | "supabase";

/**
 * Creates a PlatformStore. Without SUPABASE_URL + SERVICE_ROLE, uses memory
 * (local/dev/CI). Real Supabase client wiring lands when credentials exist;
 * schema is in migrations/001_init.sql with RLS deny-all.
 */
export function createPlatformAdapter(
  env: NodeJS.ProcessEnv = process.env,
): { mode: AdapterMode; store: PlatformStore } {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    // Placeholder: future Drizzle/Supabase client. Fall back to memory with warning
    // so CI without secrets still runs; log once for operators.
    console.warn(
      "[platform-adapter-supabase] credentials present but remote client not yet wired; using memory store",
    );
  }
  return { mode: "memory", store: createMemoryStore() };
}

export { createMemoryStore };
