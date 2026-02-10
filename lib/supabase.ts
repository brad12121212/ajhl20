import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client with service role (for Storage uploads).
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */
export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment."
      );
    }
    client = createClient(supabaseUrl, supabaseServiceKey);
  }
  return client;
}

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}
