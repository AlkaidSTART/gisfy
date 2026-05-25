import type { Asset } from "@/types";

const userStores = new Map<string, Map<string, Asset>>();
const ASSET_STORE_MAX_PER_USER = Math.max(
  1,
  Number(process.env.ASSET_STORE_MAX_PER_USER ?? 1000),
);
const ASSET_STORE_TTL_MS = Math.max(
  60_000,
  Number(process.env.ASSET_STORE_TTL_MS ?? 7 * 24 * 60 * 60 * 1000),
);

function getUserStore(userId: string) {
  if (!userStores.has(userId)) userStores.set(userId, new Map());
  return userStores.get(userId)!;
}

function createdAtMs(asset: Asset) {
  const ms = new Date(asset.createdAt).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function cleanupUserStore(store: Map<string, Asset>) {
  const now = Date.now();
  const sorted = Array.from(store.entries()).sort(
    (a, b) => createdAtMs(a[1]) - createdAtMs(b[1]),
  );

  for (const [id, asset] of sorted) {
    if (now - createdAtMs(asset) > ASSET_STORE_TTL_MS) {
      store.delete(id);
    }
  }

  if (store.size <= ASSET_STORE_MAX_PER_USER) return;
  const overflow = store.size - ASSET_STORE_MAX_PER_USER;
  const oldest = Array.from(store.entries())
    .sort((a, b) => createdAtMs(a[1]) - createdAtMs(b[1]))
    .slice(0, overflow);
  for (const [id] of oldest) store.delete(id);
}

export function upsertAssets(userId: string, assets: Asset[]) {
  const store = getUserStore(userId);
  for (const a of assets) store.set(a.id, a);
  cleanupUserStore(store);
}

export function listAssets(userId: string) {
  const store = getUserStore(userId);
  cleanupUserStore(store);
  return Array.from(store.values());
}

export function getAssetsByIds(userId: string, ids: string[]) {
  const store = getUserStore(userId);
  return ids
    .map((id) => store.get(id))
    .filter((asset): asset is Asset => asset !== undefined);
}

export function deleteAsset(userId: string, id: string) {
  return getUserStore(userId).delete(id);
}
