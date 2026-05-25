import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { buildPrompt } from "@/lib/prompt-templates";
import { generateWithAli } from "@/lib/ali";
import { uploadToSupabase } from "@/lib/supabase-storage";
import { createTask, updateTask } from "@/lib/store/task-store";
import { upsertAssets } from "@/lib/asset-repo";
import {
  enqueueGenerationTask,
  ensureGenerationWorker,
} from "@/lib/generation-queue";
import type { Asset, AssetType, GenerateTask, Style } from "@/types";

function mockBase64Png() {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2Z8VkAAAAASUVORK5CYII=";
}

function stripDataUrlPrefix(input: string) {
  return input.replace(/^data:image\/\w+;base64,/, "");
}

function toPngDataUrl(buffer: Buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function normalizeBackground(
  base64Url: string,
  transparent: boolean,
): Promise<string> {
  const src = Buffer.from(stripDataUrlPrefix(base64Url), "base64");
  if (transparent) {
    const normalized = await sharp(src)
      .ensureAlpha()
      .png()
      .toBuffer();
    return toPngDataUrl(normalized);
  }

  const normalized = await sharp(src)
    .removeAlpha()
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
  return toPngDataUrl(normalized);
}

async function retry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  throw lastError;
}

export interface StartTaskInput {
  prompt: string;
  style: Style;
  type: AssetType;
  size: 512 | 1024 | 2048;
  count: 1 | 4 | 9;
  transparent?: boolean;
  seed?: number;
  negativePrompt?: string;
  promptMode?: "template" | "raw";
}

export async function createGenerationTask(
  input: StartTaskInput,
  taskId = `task_${randomUUID().slice(0, 8)}`,
) {
  const task: GenerateTask = {
    taskId,
    status: "queued",
    progress: 0,
    prompt: input.prompt,
    style: input.style,
    type: input.type,
    createdAt: new Date().toISOString(),
  };

  await createTask(task);
  return taskId;
}

export async function startGenerationTask(
  input: StartTaskInput,
  userId = "default",
) {
  const taskId = await createGenerationTask(input);
  try {
    await enqueueGenerationTask({ taskId, userId, body: input });
  } catch (error) {
    await updateTask(taskId, {
      status: "failed",
      progress: 0,
      error: error instanceof Error ? error.message : "enqueue_failed",
    });
    throw error;
  }
  ensureGenerationWorker();

  return taskId;
}

export async function runGenerationTask(
  taskId: string,
  body: StartTaskInput,
  userId: string,
) {
  await runGeneration(
    {
      taskId,
      status: "queued",
      progress: 0,
      prompt: body.prompt,
      style: body.style,
      type: body.type,
      createdAt: new Date().toISOString(),
    },
    body,
    userId,
  );
}

async function runGeneration(
  task: GenerateTask,
  body: StartTaskInput,
  userId: string,
) {
  const timeoutMs = Math.max(
    1_000,
    Number(process.env.GENERATE_TASK_TIMEOUT_MS ?? 120_000),
  );
  const abort = new AbortController();
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  try {
    await updateTask(task.taskId, { status: "processing", progress: 20 });

    const built =
      body.promptMode === "raw"
        ? { prompt: body.prompt, negativePrompt: body.negativePrompt ?? "" }
        : buildPrompt(body);
    const startedAt = Date.now();

    let images: Array<{
      id: string;
      url: string;
      prompt: string;
      style: typeof body.style;
      type: typeof body.type;
      size: number;
    }>;

    await Promise.race([
      (async () => {
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
          const aiResult = await retry(() =>
            generateWithAli({
              prompt: built.prompt,
              size: Math.max(body.size, 512),
              count: body.count,
              seed: body.seed,
              signal: abort.signal,
            }),
          );

          images = aiResult.images.map((img) => ({
            id: `gisfy_${randomUUID().slice(0, 8)}`,
            url: img.base64 ? `data:image/png;base64,${img.base64}` : "",
            prompt: body.prompt,
            style: body.style,
            type: body.type,
            size: body.size,
          }));
        }

        images = await Promise.all(
          images.map(async (img) => ({
            ...img,
            url: await normalizeBackground(img.url, body.transparent !== false),
          })),
        );

        await updateTask(task.taskId, { status: "uploading", progress: 70 });

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
          size: img.size as 512 | 1024 | 2048,
          cost: 0,
          duration: (Date.now() - startedAt) / 1000,
          createdAt: new Date().toISOString(),
        }));
        await upsertAssets(userId, assets);

        await updateTask(task.taskId, {
          status: "completed",
          progress: 100,
          images: uploaded,
        });
      })(),
      new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          abort.abort(new Error("task_timeout"));
          reject(new Error("task_timeout"));
        }, timeoutMs);
      }),
    ]);
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
    await updateTask(task.taskId, { status: "failed", progress: 0, error: message });
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    if (!abort.signal.aborted) abort.abort(new Error("done"));
  }
}
