import JSZip from "jszip";

const EXPORT_MAX_ITEMS = Math.max(
  1,
  Number(process.env.EXPORT_MAX_ITEMS ?? 100),
);
const EXPORT_FETCH_CONCURRENCY = Math.max(
  1,
  Number(process.env.EXPORT_FETCH_CONCURRENCY ?? 4),
);

async function fetchBlob(url: string, fallbackType: string) {
  if (url.startsWith("data:")) {
    const res = await fetch(url);
    return res.blob();
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载资源失败: ${url}`);
  const blob = await res.blob();
  return blob.type ? blob : new Blob([blob], { type: fallbackType });
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  let idx = 0;
  const consumers = Array.from({ length: Math.min(limit, items.length) }).map(
    async () => {
      while (idx < items.length) {
        const current = items[idx];
        idx += 1;
        await worker(current);
      }
    },
  );
  await Promise.all(consumers);
}

export async function createExportPackage(input: {
  name: string;
  spriteItems: Array<{ filename: string; url: string }>;
  spritesheet: { pngUrl: string; jsonUrl: string };
  manifest: Record<string, unknown>;
}) {
  if (input.spriteItems.length > EXPORT_MAX_ITEMS) {
    throw new Error(`导出数量超限，最多 ${EXPORT_MAX_ITEMS} 张`);
  }
  const zip = new JSZip();
  const spritesFolder = zip.folder("sprites");
  if (!spritesFolder) throw new Error("创建 sprites 目录失败");

  await runWithConcurrency(
    input.spriteItems,
    EXPORT_FETCH_CONCURRENCY,
    async (item) => {
      const blob = await fetchBlob(item.url, "image/png");
      spritesFolder.file(item.filename, blob);
    },
  );

  const sheetPng = await fetchBlob(input.spritesheet.pngUrl, "image/png");
  const sheetJson = await fetchBlob(input.spritesheet.jsonUrl, "application/json");

  zip.file("spritesheet.png", sheetPng);
  zip.file("spritesheet.json", sheetJson);
  zip.file("manifest.json", JSON.stringify(input.manifest, null, 2));

  return zip.generateAsync({ type: "blob" });
}
