import { randomUUID } from "node:crypto";
import { generateRequestSchema } from "@/types";
import type { GenerateTask } from "@/types";
import { buildPrompt } from "@/lib/prompt-templates";
import { fail, ok } from "@/lib/response";
import { generateWithAli } from "@/lib/ali";
import { uploadToSupabase } from "@/lib/supabase-storage";
import { createTask, updateTask } from "@/lib/store/task-store";
import { upsertAssets } from "@/lib/store/assets-store";
import type { Asset } from "@/types";

function mockBase64Png() {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2Z8VkAAAAASUVORK5CYII=";
}

async function runGeneration(task: GenerateTask, body: {
  prompt: string;
  style: "pixel" | "flat" | "anime";
  type: "character" | "monster" | "scene" | "tile" | "item" | "ui" | "effect";
  size: 64 | 128 | 256 | 512;
  count: 1 | 4 | 9;
  seed?: number;
}) {
  try {
    updateTask(task.taskId, { status: "processing", progress: 20 });

    const built = buildPrompt(body);
    const startedAt = Date.now();

    let images: Array<{ id: string; url: string; prompt: string; style: typeof body.style; type: typeof body.type; size: number }>;

    // Mock mode when no API key
    if (!process.env.ALI_API_KEY) {
      images = Array.from({ length: body.count }).map(() => ({
        id: `gisfy_${randomUUID().slice(0, 8)}`,
        url: mockBase64Png(),
        prompt: body.prompt,
        style: body.style,
        type: body.type,
        size: body.size,
      }));
      await new Promise((r) => setTimeout(r, 1500));
    } else {
      const aiResult = await generateWithAli({
        prompt: built.prompt,
        size: body.size,
        count: body.count,
        seed: body.seed,
      });

      images = aiResult.images.map((img) => ({
        id: `gisfy_${randomUUID().slice(0, 8)}`,
        url: img.base64
          ? `data:image/png;base64,${img.base64}`
          : "",
        prompt: body.prompt,
        style: body.style,
        type: body.type,
        size: body.size,
      }));
    }

    updateTask(task.taskId, { status: "uploading", progress: 70 });

    // Upload to Supabase Storage
    const uploaded = await Promise.all(
      images.map(async (img) => {
        if (!process.env.SUPABASE_URL) {
          return { ...img, url: img.url };
        }
        const result = await uploadToSupabase({
          id: img.id,
          base64: img.url,
          filename: `${img.type}_${img.style}_${img.id}.png`,
        });
        return { ...img, url: result.cdnUrl };
      }),
    );

    // Save to asset store
    const assets: Asset[] = uploaded.map((img) => ({
      id: img.id,
      cdnUrl: img.url,
      prompt: img.prompt,
      style: img.style,
      type: img.type,
      size: img.size as 64 | 128 | 256 | 512,
      cost: 0,
      duration: (Date.now() - startedAt) / 1000,
      createdAt: new Date().toISOString(),
    }));
    upsertAssets(assets);

    updateTask(task.taskId, {
      status: "completed",
      progress: 100,
      images: uploaded,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    updateTask(task.taskId, { status: "failed", progress: 0, error: message });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = generateRequestSchema.safeParse(json);
    if (!parsed.success) {
      return fail("invalid_params", parsed.error.issues[0]?.message || "参数错误", 400);
    }

    const body = parsed.data;
    const taskId = `task_${randomUUID().slice(0, 8)}`;

    const task: GenerateTask = {
      taskId,
      status: "queued",
      progress: 0,
      prompt: body.prompt,
      style: body.style,
      type: body.type,
      createdAt: new Date().toISOString(),
    };

    createTask(task);

    // Fire-and-forget async generation
    runGeneration(task, body);

    return ok({ taskId, status: "queued" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    return fail("generate_failed", message, 500);
  }
}
