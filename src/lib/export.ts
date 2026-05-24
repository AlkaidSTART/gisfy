import JSZip from "jszip";

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

export async function createExportPackage(input: {
  name: string;
  spriteItems: Array<{ filename: string; url: string }>;
  spritesheet: { pngUrl: string; jsonUrl: string };
  manifest: Record<string, unknown>;
}) {
  const zip = new JSZip();
  const spritesFolder = zip.folder("sprites");
  if (!spritesFolder) throw new Error("创建 sprites 目录失败");

  await Promise.all(
    input.spriteItems.map(async (item) => {
      const blob = await fetchBlob(item.url, "image/png");
      spritesFolder.file(item.filename, blob);
    }),
  );

  const sheetPng = await fetchBlob(input.spritesheet.pngUrl, "image/png");
  const sheetJson = await fetchBlob(input.spritesheet.jsonUrl, "application/json");

  zip.file("spritesheet.png", sheetPng);
  zip.file("spritesheet.json", sheetJson);
  zip.file("manifest.json", JSON.stringify(input.manifest, null, 2));

  return zip.generateAsync({ type: "blob" });
}
