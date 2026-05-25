import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  var _supabaseDb: SupabaseClient | undefined;
}

function createSupabaseDb(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseDb(): SupabaseClient {
  if (globalThis._supabaseDb) return globalThis._supabaseDb;
  const client = createSupabaseDb();
  if (process.env.NODE_ENV !== "production") {
    globalThis._supabaseDb = client;
  }
  return client;
}

export default getSupabaseDb;
