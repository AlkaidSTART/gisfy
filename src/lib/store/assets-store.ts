import type { Asset } from "@/types";

const store = new Map<string, Asset>();

export function upsertAssets(assets: Asset[]) {
  for (const a of assets) store.set(a.id, a);
}

export function listAssets() {
  return Array.from(store.values());
}

export function deleteAsset(id: string) {
  return store.delete(id);
}
