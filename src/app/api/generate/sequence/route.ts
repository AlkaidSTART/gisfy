import { randomUUID } from "node:crypto";
import {
  generateSequenceRequestSchema,
  type SequenceTaskInfo,
} from "@/types";
import { fail, ok } from "@/lib/response";
import { ANIMATION_TEMPLATES, DIRECTION_LABELS } from "@/lib/animation-templates";
import { startGenerationTask } from "@/lib/generation";

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

    const tasks: SequenceTaskInfo[] = [];

    for (let direction = 0; direction < directionCount; direction += 1) {
      for (let frame = 1; frame <= template.frames; frame += 1) {
        const directionLabel = directions[direction] ?? String(direction + 1);
        const framePrompt = template.prompt
          .replace("{角色描述}", body.prompt)
          .replace("{frame}", String(frame));
        const enrichedPrompt = `${framePrompt}，${directionLabel}朝向，${identityAnchor}`;

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
