import { randomUUID } from "node:crypto";
import { generateSequenceRequestSchema, type SequenceTaskInfo } from "@/types";
import { fail, ok } from "@/lib/response";
import {
  ANIMATION_TEMPLATES,
  DIRECTION_LABELS,
} from "@/lib/animation-templates";
import { createGenerationTask } from "@/lib/generation";
import {
  enqueueGenerationTask,
  ensureGenerationWorker,
} from "@/lib/generation-queue";
import { updateTask } from "@/lib/store/task-store";

export const maxDuration = 300;

function buildFramePrompt(input: {
  basePrompt: string;
  actionPrompt: string;
  phase: string;
  previousPhase?: string;
  nextPhase?: string;
  frame: number;
  totalFrames: number;
  directionLabel: string;
  transparent: boolean;
}) {
  return [
    `角色视觉锚点：${input.basePrompt}`,
    `动作类型：${input.actionPrompt}`,
    `${input.directionLabel}朝向`,
    `这是连续2D游戏动画的第 ${input.frame}/${input.totalFrames} 帧，只生成这一帧`,
    `当前帧姿态：${input.phase}`,
    input.previousPhase ? `上一帧姿态参考：${input.previousPhase}` : "",
    input.nextPhase ? `下一帧姿态参考：${input.nextPhase}` : "",
    "请像传统2D角色动画师绘制关键帧一样处理：当前帧必须是上一帧到下一帧之间的自然过渡",
    "使用onion-skin思维保持轮廓连续，头部、躯干、四肢和武器的位置变化要符合运动轨迹",
    input.transparent
      ? "2D游戏角色spritesheet单帧，透明背景PNG，角色完整全身居中"
      : "2D游戏角色spritesheet单帧，保留原图背景，不要抠图，角色完整全身居中",
    "所有帧必须保持同一画布尺寸、同一角色比例、同一镜头距离、同一脚底基线、同一角色中心锚点",
    "除当前动作姿态外，发型、脸型、服装、武器、装备、配色、材质、轮廓体型必须完全一致",
    "角色不要重新设计，不要改变年龄、性别、种族、发型长度、服装结构或武器形状",
    "动作幅度清晰但不要瞬移，重心变化合理，四肢关节弯曲方向自然",
    "输出必须可直接按帧序导入Unity/Godot/Phaser播放",
    "不要生成多格漫画，不要把多个帧画在同一张图里，只输出单个角色单个姿态",
  ]
    .filter(Boolean)
    .join("，");
}

function buildSequenceNegativePrompt(input?: string) {
  return [
    input,
    "多角色",
    "多个角色",
    "多帧拼图",
    "分镜漫画",
    "文字",
    "水印",
    "边框",
    "背景场景",
    "阴影地面",
    "裁切身体",
    "缺手缺脚",
    "角色比例变化",
    "服装变化",
    "发型变化",
    "颜色变化",
    "镜头远近变化",
    "位置漂移",
    "模糊",
    "低质量",
  ]
    .filter(Boolean)
    .join("，");
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
    const directions = DIRECTION_LABELS[directionCount as 1 | 2 | 4];
    const sequenceId = `seq_${randomUUID().slice(0, 8)}`;
    const userId = (json as { userId?: string }).userId || "default";
    const sharedSeed = body.seed ?? Math.floor(Math.random() * 2_147_483_647);
    const sequenceNegativePrompt = buildSequenceNegativePrompt(
      body.negativePrompt,
    );

    const tasks: SequenceTaskInfo[] = [];
    for (let direction = 0; direction < directionCount; direction += 1) {
      for (let frame = 1; frame <= template.frames; frame += 1) {
        const directionLabel = directions[direction] ?? String(direction + 1);
        const actionPrompt = template.prompt
          .replace("{角色描述}", body.prompt)
          .replace("{frame}", String(frame));
        const enrichedPrompt = buildFramePrompt({
          basePrompt: body.prompt,
          actionPrompt,
          phase: template.phases[frame - 1] ?? actionPrompt,
          previousPhase: template.phases[frame - 2],
          nextPhase: template.phases[frame] ?? template.phases[0],
          frame,
          totalFrames: template.frames,
          directionLabel,
          transparent: body.transparent,
        });

        const taskId = `task_${randomUUID().slice(0, 8)}`;
        const taskBody = {
          prompt: enrichedPrompt,
          style: body.style,
          type: "character" as const,
          size: body.size,
          count: 1 as const,
          transparent: body.transparent,
          seed: sharedSeed,
          negativePrompt: sequenceNegativePrompt,
          promptMode: "raw" as const,
        };
        await createGenerationTask(taskBody, taskId);
        try {
          await enqueueGenerationTask({ taskId, userId, body: taskBody });
        } catch (error) {
          await updateTask(taskId, {
            status: "failed",
            progress: 0,
            error: error instanceof Error ? error.message : "enqueue_failed",
          });
          throw error;
        }

        tasks.push({
          taskId,
          frame,
          direction: direction + 1,
          directionLabel,
          prompt: enrichedPrompt,
        });
      }
    }
    ensureGenerationWorker();

    return ok({
      sequenceId,
      tasks,
      total: tasks.length,
      seed: sharedSeed,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "sequence 生成失败";
    return fail("sequence_failed", message, 500);
  }
}
