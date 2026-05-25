import { randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  generateSequenceRequestSchema,
  type SequenceTaskInfo,
  type Asset,
  type GenerateTask,
} from "@/types";
import { fail, ok } from "@/lib/response";
import { ANIMATION_TEMPLATES, DIRECTION_LABELS } from "@/lib/animation-templates";
import { buildPrompt } from "@/lib/prompt-templates";
import { generateWithAli } from "@/lib/ali";
import { uploadToSupabase } from "@/lib/supabase-storage";
import { createTask } from "@/lib/store/task-store";
import { upsertAssets } from "@/lib/asset-repo";

function toBufferFromDataUrl(dataUrl: string) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, "base64");
}

function toPngDataUrl(buffer: Buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function splitFrames(imageUrl: string, frameCount: number) {
  const input = toBufferFromDataUrl(imageUrl);
  const base = sharp(input, { failOn: "none" });
  const meta = await base.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height || frameCount < 1) {
    return [imageUrl];
  }
  if (width < frameCount) {
    return Array.from({ length: frameCount }).map(() => imageUrl);
  }

  const frameWidth = Math.max(1, Math.floor(width / frameCount));
  const frames: string[] = [];
  for (let frame = 0; frame < frameCount; frame += 1) {
    const left = frame * frameWidth;
    const extractWidth =
      frame === frameCount - 1 ? width - left : Math.min(frameWidth, width - left);
    const cut = await base
      .clone()
      .extract({
        left,
        top: 0,
        width: Math.max(1, extractWidth),
        height,
      })
      .png()
      .toBuffer();
    frames.push(toPngDataUrl(cut));
  }
  return frames;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = generateSequenceRequestSchema.safeParse(json);
    if (!parsed.success) {
      return fail(
        "invalid_params",
        parsed.error.issues[0]?.message || "参数错误",
        400,
      );
    }

    const body = parsed.data;
    const template = ANIMATION_TEMPLATES[body.template];
    const directionCount = body.direction ?? template.direction;
    const directions = DIRECTION_LABELS[directionCount as 2 | 4];
    const sequenceId = `seq_${randomUUID().slice(0, 8)}`;
    const userId = (json as { userId?: string }).userId || "default";
    const baseSeed = body.seed ?? Math.floor(Math.random() * 2_147_483_647);
    const identityAnchor =
      "同一角色设定：角色外观、发型、服饰、配色、体型保持完全一致；仅动作和朝向变化。";
    const spriteSheetAnchor =
      "输出一张横向动作序列图，包含连续关键帧，帧与帧之间边界清晰，透明背景。";

    const tasks: SequenceTaskInfo[] = [];
    const assets: Asset[] = [];

    for (let direction = 0; direction < directionCount; direction += 1) {
      const directionLabel = directions[direction] ?? String(direction + 1);
      const sequencePrompt = `${body.prompt}，${template.prompt
        .replace("{角色描述}", body.prompt)
        .replace("{frame}", "关键帧")}，${directionLabel}朝向，${identityAnchor}，${spriteSheetAnchor}`;

      const built = buildPrompt({
        prompt: sequencePrompt,
        style: body.style,
        type: "character",
        negativePrompt: body.negativePrompt,
      });

      const aiResult = process.env.ALI_API_KEY
        ? await generateWithAli({
            prompt: built.prompt,
            size: Math.max(body.size, 512),
            count: 1,
            seed: baseSeed + direction,
          })
        : {
            images: [
              {
                base64:
                  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2Z8VkAAAAASUVORK5CYII=",
              },
            ],
          };

      const baseImage = aiResult.images[0]?.base64
        ? `data:image/png;base64,${aiResult.images[0].base64}`
        : "";
      const frames = baseImage
        ? await splitFrames(baseImage, template.frames)
        : Array.from({ length: template.frames }).map(() => baseImage);

      for (let frame = 1; frame <= template.frames; frame += 1) {
        const framePrompt = template.prompt
          .replace("{角色描述}", body.prompt)
          .replace("{frame}", String(frame));
        const enrichedPrompt = `${framePrompt}，${directionLabel}朝向，${identityAnchor}`;
        const id = `gisfy_${randomUUID().slice(0, 8)}`;
        const frameImage = frames[frame - 1] || baseImage;
        const finalUrl = process.env.SUPABASE_URL
          ? (
              await uploadToSupabase({
                id,
                base64: frameImage,
                filename: `seq_${body.template}_${direction + 1}_${frame}_${id}.png`,
              })
            ).cdnUrl
          : frameImage;

        assets.push({
          id,
          cdnUrl: finalUrl,
          prompt: enrichedPrompt,
          style: body.style,
          type: "character",
          size: body.size,
          cost: 0,
          duration: 0,
          createdAt: new Date().toISOString(),
        });

        const taskId = `task_${randomUUID().slice(0, 8)}`;
        const task: GenerateTask = {
          taskId,
          status: "completed",
          progress: 100,
          prompt: enrichedPrompt,
          style: body.style,
          type: "character",
          createdAt: new Date().toISOString(),
          images: [
            {
              id,
              url: finalUrl,
              prompt: enrichedPrompt,
              style: body.style,
              type: "character",
              size: body.size,
            },
          ],
        };
        createTask(task);

        tasks.push({
          taskId,
          frame,
          direction: direction + 1,
          directionLabel,
          prompt: enrichedPrompt,
        });
      }
    }

    if (assets.length > 0) {
      await upsertAssets(userId, assets);
    }

    return ok({
      sequenceId,
      tasks,
      total: tasks.length,
      baseSeed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "sequence 生成失败";
    return fail("sequence_failed", message, 500);
  }
}
