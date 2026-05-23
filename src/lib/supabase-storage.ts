import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl) throw new Error("SUPABASE_URL is missing");
  _supabase = createClient(supabaseUrl, supabaseKey);
  return _supabase;
}

const BUCKET = process.env.SUPABASE_BUCKET || "gisfy-assets";

async function ensureBucket() {
  const s = getSupabase();
  const { data, error } = await s.storage.getBucket(BUCKET);
  if (error || !data) {
    console.warn(
      `[supabase] Bucket "${BUCKET}" not found. ` +
        "Please create it at: Storage > New Bucket (public). " +
        "Uploads will be skipped until then.",
    );
    return false;
  }
  return true;
}

export async function uploadToSupabase(input: {
  id: string;
  base64: string;
  filename: string;
}): Promise<{ id: string; cdnUrl: string; size: number }> {
  if (!process.env.SUPABASE_URL) {
    return { id: input.id, cdnUrl: input.base64, size: 0 };
  }

  const ok = await ensureBucket();
  if (!ok) {
    // Bucket not available — return base64 as fallback
    const pureBase64 = input.base64.replace(/^data:image\/\w+;base64,/, "");
    return {
      id: input.id,
      cdnUrl: input.base64,
      size: Buffer.byteLength(pureBase64, "base64"),
    };
  }

  const s = getSupabase();
  const pureBase64 = input.base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(pureBase64, "base64");
  const path = `assets/${input.filename}`;

  const { error } = await s.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: "image/png", upsert: true });

  if (error) {
    console.error("[supabase] upload error:", error.message);
    return { id: input.id, cdnUrl: input.base64, size: buffer.length };
  }

  const { data: urlData } = s.storage.from(BUCKET).getPublicUrl(path);

  return {
    id: input.id,
    cdnUrl: urlData.publicUrl,
    size: buffer.length,
  };
}

export async function listSupabaseAssets(): Promise<
  Array<{ id: string; name: string; url: string }>
> {
  if (!process.env.SUPABASE_URL) return [];
  const s = getSupabase();
  const { data, error } = await s.storage.from(BUCKET).list("assets");
  if (error || !data) return [];
  return data.map((f) => ({
    id: f.id || f.name,
    name: f.name,
    url: s.storage.from(BUCKET).getPublicUrl(`assets/${f.name}`).data.publicUrl,
  }));
}
