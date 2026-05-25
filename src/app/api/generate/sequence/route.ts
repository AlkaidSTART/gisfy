import { randomUUID } from "node:crypto";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  generateSequenceRequestSchema,
  type SequenceTaskInfo,
} from "@/types";
import { fail, ok } from "@/lib/response";
import { ANIMATION_TEMPLATES, DIRECTION_LABELS } from "@/lib/animation-templates";
import { generateWithAli } from "@/lib/ali";
import { buildPrompt } from "@/lib/prompt-templates";
import { startGenerationTask } from "@/lib/generation";

async function buildVisualAnchorFromBaseFrame(
  prompt: string,
  style: "pixel" | "flat" | "anime",
  size: 64 | 128 | 256 | 512,
  seed: number,
) {
  if (!process.env.ALI_API_KEY) return "";

  const basePrompt = buildPrompt({
    prompt,
    style,
    type: "character",
    size,
    count: 1,
  }).prompt;
  const first = await generateWithAli({
    prompt: basePrompt,
    size: Math.max(size, 512),
    count: 1,
    seed,
  });
  const base64 = first.images[0]?.base64;
  if (!base64) return "";

  const aliyun = createOpenAI({
    apiKey: process.env.ALI_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
  const { text } = await generateText({
    model: aliyun(process.env.VISION_MODEL || "qwen-vl-max"),
    system:
      "你是游戏角色一致性分析器。请提取角色可复用视觉锚点：发型、配色、服装结构、体型、武器/配件，60字内。",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "提取这张角色图的视觉锚点：" },
          { type: "image", image: `data:image/png;base64,${base64}` },
        ],
      },
    ],
  });
  return text.trim();
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
    const sharedSeed = body.seed ?? Math.floor(Math.random() * 2_147_483_647);
    const identityAnchor =
      "同一角色设定：角色外观、发型、服饰、配色、体型保持完全一致；仅动作和朝向变化。";
    const anchorFramePrompt = template.prompt
      .replace("{角色描述}", body.prompt)
      .replace("{frame}", "1");
    const visualAnchor = await buildVisualAnchorFromBaseFrame(
      anchorFramePrompt,
      body.style,
      body.size,
      sharedSeed,
    );

    const tasks: SequenceTaskInfo[] = [];

    for (let direction = 0; direction < directionCount; direction += 1) {
      for (let frame = 1; frame <= template.frames; frame += 1) {
        const directionLabel = directions[direction] ?? String(direction + 1);
        const framePrompt = template.prompt
          .replace("{角色描述}", body.prompt)
          .replace("{frame}", String(frame));
        const enrichedPrompt = [
          framePrompt,
          `${directionLabel}朝向`,
          identityAnchor,
          visualAnchor ? `视觉锚点：${visualAnchor}` : "",
          "固定seed与负面提示词保持一致。",
        ]
          .filter(Boolean)
          .join("，");

        const taskId = startGenerationTask(
          {
            prompt: enrichedPrompt,
            style: body.style,
            type: "character",
            size: body.size,
            count: 1,
            seed: sharedSeed,
            negativePrompt: body.negativePrompt,
          },
          userId,
        );

        tasks.push({
          taskId,
          frame,
          direction: direction + 1,
          directionLabel,
          prompt: enrichedPrompt,
        });
      }
    }

    return ok({
      sequenceId,
      tasks,
      total: tasks.length,
      seed: sharedSeed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "sequence 生成失败";
    return fail("sequence_failed", message, 500);
  }
}
