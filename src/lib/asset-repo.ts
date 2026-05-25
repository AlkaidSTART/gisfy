import type { Asset } from "@/types";
import {
  deleteAsset as deleteAssetMem,
  getAssetsByIds as getAssetsByIdsMem,
  listAssets as listAssetsMem,
  upsertAssets as upsertAssetsMem,
} from "@/lib/store/assets-store";

const TABLE = "assets";

type DbAssetRow = {
  id: string;
  user_id: string;
  cdn_url: string;
  prompt: string;
  style: Asset["style"];
  type: Asset["type"];
  size: number;
  seed: number | null;
  cost: number;
  duration: number;
  created_at: string;
};

function toAsset(row: DbAssetRow): Asset {
  return {
    id: row.id,
    cdnUrl: row.cdn_url,
    prompt: row.prompt,
    style: row.style,
    type: row.type,
    size: row.size as 64 | 128 | 256 | 512,
    seed: row.seed ?? undefined,
    cost: row.cost,
    duration: row.duration,
    createdAt: row.created_at,
  };
}

async function getSupabaseDb() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  const mod = await import("@/lib/supabase-db");
  return mod.default;
}

export async function upsertAssets(userId: string, assets: Asset[]) {
  const db = await getSupabaseDb();
  if (!db) {
    upsertAssetsMem(userId, assets);
    return;
  }

  const rows = assets.map((a) => ({
    id: a.id,
    user_id: userId,
    cdn_url: a.cdnUrl,
    prompt: a.prompt,
    style: a.style,
    type: a.type,
    size: a.size,
    seed: a.seed ?? null,
    cost: a.cost,
    duration: a.duration,
    created_at: a.createdAt,
  }));

  const { error } = await db.from(TABLE).upsert(rows, { onConflict: "id" });
  if (error) {
    upsertAssetsMem(userId, assets);
  }
}

export async function listAssets(userId: string): Promise<Asset[]> {
  const db = await getSupabaseDb();
  if (!db) return listAssetsMem(userId);

  const { data, error } = await db
    .from(TABLE)
    .select(
      "id,user_id,cdn_url,prompt,style,type,size,seed,cost,duration,created_at",
    )
    .eq("user_id", userId);

  if (error || !data) return listAssetsMem(userId);
  return (data as DbAssetRow[]).map(toAsset);
}

export async function getAssetsByIds(
  userId: string,
  ids: string[],
): Promise<Asset[]> {
  const db = await getSupabaseDb();
  if (!db) return getAssetsByIdsMem(userId, ids);

  const { data, error } = await db
    .from(TABLE)
    .select(
      "id,user_id,cdn_url,prompt,style,type,size,seed,cost,duration,created_at",
    )
    .eq("user_id", userId)
    .in("id", ids);

  if (error || !data) return getAssetsByIdsMem(userId, ids);
  return (data as DbAssetRow[]).map(toAsset);
}

export async function deleteAsset(userId: string, id: string) {
  const db = await getSupabaseDb();
  if (!db) return deleteAssetMem(userId, id);

  const { error } = await db.from(TABLE).delete().eq("user_id", userId).eq("id", id);
  if (error) return deleteAssetMem(userId, id);
  return true;
}
