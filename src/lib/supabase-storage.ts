import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = process.env.SUPABASE_BUCKET || "gisfy-assets";

function ensureBucket() {
  // Lazily ensure bucket exists (idempotent)
  return supabase.storage.getBucket(BUCKET).catch(() =>
    supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
    }),
  );
}

export async function uploadToSupabase(input: {
  id: string;
  base64: string;
  filename: string;
}): Promise<{ id: string; cdnUrl: string; size: number }> {
  await ensureBucket();

  const pureBase64 = input.base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(pureBase64, "base64");
  const path = `assets/${input.filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: "image/png", upsert: true });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return {
    id: input.id,
    cdnUrl: urlData.publicUrl,
    size: buffer.length,
  };
}
