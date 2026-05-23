import { describe, expect, it } from "vitest";
import { GET as assetsGet, POST as assetsPost, DELETE as assetsDelete } from "@/app/api/assets/route";
import { POST as generatePost } from "@/app/api/generate/route";
import { POST as uploadPost } from "@/app/api/upload/route";

describe("API connectivity", () => {
  it("generate -> upload -> assets list/delete works", async () => {
    const generateReq = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "测试角色",
        style: "pixel",
        type: "character",
        size: 256,
        count: 1,
      }),
    });

    const generateRes = await generatePost(generateReq);
    expect(generateRes.status).toBe(200);
    const generateJson = await generateRes.json();
    expect(generateJson.success).toBe(true);

    const image = generateJson.data.images[0];
    expect(image.id).toBeTruthy();
    expect(String(image.url)).toContain("data:image/png;base64,");

    const uploadReq = new Request("http://localhost/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: [
          {
            id: image.id,
            base64: image.url,
            filename: `${image.id}.png`,
          },
        ],
      }),
    });

    const uploadRes = await uploadPost(uploadReq);
    expect(uploadRes.status).toBe(200);
    const uploadJson = await uploadRes.json();
    expect(uploadJson.success).toBe(true);
    expect(uploadJson.data.urls[0].cdnUrl).toBeTruthy();

    const saveReq = new Request("http://localhost/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assets: [
          {
            ...image,
            url: uploadJson.data.urls[0].cdnUrl,
          },
        ],
      }),
    });

    const saveRes = await assetsPost(saveReq);
    expect(saveRes.status).toBe(200);

    const listRes = await assetsGet(new Request("http://localhost/api/assets?page=1&limit=20&sort=newest"));
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.success).toBe(true);
    expect(Array.isArray(listJson.data.assets)).toBe(true);
    expect(listJson.data.assets.some((a: { id: string }) => a.id === image.id)).toBe(true);

    const delReq = new Request("http://localhost/api/assets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: image.id }),
    });
    const delRes = await assetsDelete(delReq);
    expect(delRes.status).toBe(200);
  });
});
