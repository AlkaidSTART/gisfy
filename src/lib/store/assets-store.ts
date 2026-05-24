import type { Asset } from "@/types";

const userStores = new Map<string, Map<string, Asset>>();

function getUserStore(userId: string) {
  if (!userStores.has(userId)) userStores.set(userId, new Map());
  return userStores.get(userId)!;
}

export function upsertAssets(userId: string, assets: Asset[]) {
  const store = getUserStore(userId);
  for (const a of assets) store.set(a.id, a);
}

export function listAssets(userId: string) {
  return Array.from(getUserStore(userId).values());
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
