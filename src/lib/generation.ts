import { randomUUID } from "node:crypto";
import { buildPrompt } from "@/lib/prompt-templates";
import { generateWithAli } from "@/lib/ali";
import { uploadToSupabase } from "@/lib/supabase-storage";
import { createTask, updateTask } from "@/lib/store/task-store";
import { upsertAssets } from "@/lib/asset-repo";
import type { Asset, AssetType, GenerateTask, Style } from "@/types";

function mockBase64Png() {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2Z8VkAAAAASUVORK5CYII=";
}

interface StartTaskInput {
  prompt: string;
  style: Style;
  type: AssetType;
  size: 64 | 128 | 256 | 512;
  count: 1 | 4 | 9;
  seed?: number;
  negativePrompt?: string;
}

export function startGenerationTask(input: StartTaskInput, userId = "default") {
  const taskId = `task_${randomUUID().slice(0, 8)}`;

  const task: GenerateTask = {
    taskId,
    status: "queued",
    progress: 0,
    prompt: input.prompt,
    style: input.style,
    type: input.type,
    createdAt: new Date().toISOString(),
  };

  createTask(task);
  void runGeneration(task, input, userId);

  return taskId;
}

async function runGeneration(
  task: GenerateTask,
  body: StartTaskInput,
  userId: string,
) {
  try {
    updateTask(task.taskId, { status: "processing", progress: 20 });

    const built = buildPrompt(body);
    const startedAt = Date.now();

    let images: Array<{
      id: string;
      url: string;
      prompt: string;
      style: typeof body.style;
      type: typeof body.type;
      size: number;
    }>;

    if (!process.env.ALI_API_KEY) {
      images = Array.from({ length: body.count }).map(() => ({
        id: `gisfy_${randomUUID().slice(0, 8)}`,
        url: mockBase64Png(),
        prompt: body.prompt,
        style: body.style,
        type: body.type,
        size: body.size,
      }));
      await new Promise((r) => setTimeout(r, 1200));
    } else {
      const aiResult = await generateWithAli({
        prompt: built.prompt,
        size: Math.max(body.size, 512),
        count: body.count,
        seed: body.seed,
      });

      images = aiResult.images.map((img) => ({
        id: `gisfy_${randomUUID().slice(0, 8)}`,
        url: img.base64 ? `data:image/png;base64,${img.base64}` : "",
        prompt: body.prompt,
        style: body.style,
        type: body.type,
        size: body.size,
      }));
    }

    updateTask(task.taskId, { status: "uploading", progress: 70 });

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
    await upsertAssets(userId, assets);

    updateTask(task.taskId, {
      status: "completed",
      progress: 100,
      images: uploaded,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message || error.constructor.name
        : "生成失败";
    console.error(
      "[generate] async error:",
      message,
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    );
    updateTask(task.taskId, { status: "failed", progress: 0, error: message });
  }
}
