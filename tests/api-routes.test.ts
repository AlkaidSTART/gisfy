import { describe, expect, it } from "vitest";
import {
  GET as assetsGet,
  POST as assetsPost,
  DELETE as assetsDelete,
} from "@/app/api/assets/route";
import { POST as generatePost } from "@/app/api/generate/route";
import { GET as generateStatusGet } from "@/app/api/generate/status/route";
import { POST as uploadPost } from "@/app/api/upload/route";

async function pollUntilCompleted(taskId: string, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await generateStatusGet(
      new Request(`http://localhost/api/generate/status?taskId=${taskId}`),
    );
    const json = await res.json();
    if (!json.success)
      throw new Error(`Status check failed: ${json.error?.message}`);
    if (json.data.status === "completed") return json.data;
    if (json.data.status === "failed")
      throw new Error(`Generation failed: ${json.data.error}`);
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Timed out waiting for generation");
}

describe("API connectivity", () => {
  it("generate (async) -> poll status -> upload -> assets list/delete works", async () => {
    // 1) Fire-and-forget generation
    const generateReq = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "测试角色",
        style: "pixel",
        type: "character",
        size: 512,
        count: 1,
      }),
    });

    const generateRes = await generatePost(generateReq);
    expect(generateRes.status).toBe(200);
    const generateJson = await generateRes.json();
    expect(generateJson.success).toBe(true);
    expect(generateJson.data.taskId).toBeTruthy();
    expect(generateJson.data.status).toBe("queued");

    // 2) Poll until completed (mock mode ~1.5s)
    const completed = await pollUntilCompleted(generateJson.data.taskId);
    expect(completed.images).toBeTruthy();
    expect(completed.images.length).toBeGreaterThan(0);

    const image = completed.images[0] as {
      id: string;
      url: string;
      prompt: string;
      style: string;
      type: string;
      size: number;
    };
    expect(image.id).toBeTruthy();
    expect(String(image.url)).toContain("data:image/png;base64,");

    // 3) Upload to storage (mock mode: returns base64 as-is)
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

    // 4) Save asset metadata
    const saveReq = new Request("http://localhost/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user",
        assets: [
          {
            id: image.id,
            url: uploadJson.data.urls[0].cdnUrl,
            prompt: image.prompt,
            style: image.style,
            type: image.type,
            size: image.size,
            cost: 0,
            duration: 1.5,
            cached: false,
          },
        ],
      }),
    });

    const saveRes = await assetsPost(saveReq);
    expect(saveRes.status).toBe(200);

    // 5) List assets
    const listRes = await assetsGet(
      new Request(
        "http://localhost/api/assets?page=1&limit=20&sort=newest&userId=test-user",
      ),
    );
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.success).toBe(true);
    expect(Array.isArray(listJson.data.assets)).toBe(true);
    expect(
      listJson.data.assets.some((a: { id: string }) => a.id === image.id),
    ).toBe(true);

    // 6) Delete asset
    const delReq = new Request("http://localhost/api/assets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: image.id, userId: "test-user" }),
    });
    const delRes = await assetsDelete(delReq);
    expect(delRes.status).toBe(200);
  });
});
