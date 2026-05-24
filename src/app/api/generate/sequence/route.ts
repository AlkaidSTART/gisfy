import { randomUUID } from "node:crypto";
import {
  generateSequenceRequestSchema,
  type SequenceTaskInfo,
} from "@/types";
import { fail, ok } from "@/lib/response";
import { ANIMATION_TEMPLATES, DIRECTION_LABELS } from "@/lib/animation-templates";

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
    const tasks: SequenceTaskInfo[] = [];

    for (let direction = 0; direction < directionCount; direction += 1) {
      for (let frame = 1; frame <= template.frames; frame += 1) {
        const directionLabel = directions[direction] ?? String(direction + 1);
        const framePrompt = template.prompt
          .replace("{角色描述}", body.prompt)
          .replace("{frame}", String(frame));
        tasks.push({
          taskId: `task_${randomUUID().slice(0, 8)}`,
          frame,
          direction: direction + 1,
          directionLabel,
          prompt: framePrompt,
        });
      }
    }

    return ok({
      sequenceId,
      tasks,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "sequence 生成失败";
    return fail("sequence_failed", message, 500);
  }
}
