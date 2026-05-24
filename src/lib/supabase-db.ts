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

const supabaseDb: SupabaseClient = globalThis._supabaseDb ?? createSupabaseDb();

if (process.env.NODE_ENV !== "production" && !globalThis._supabaseDb) {
  globalThis._supabaseDb = supabaseDb;
}

export default supabaseDb;
