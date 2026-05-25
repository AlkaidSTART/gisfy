import type { AnimationTemplate } from "@/types";

export const ANIMATION_TEMPLATES: Record<
  AnimationTemplate,
  { frames: number; direction: 2 | 4; prompt: string }
> = {
  idle: {
    frames: 3,
    direction: 2,
    prompt: "{角色描述}，待机呼吸动画，轻微上下浮动",
  },
  walk: {
    frames: 4,
    direction: 4,
    prompt: "{角色描述}，行走循环动画，第{frame}帧",
  },
  attack: {
    frames: 4,
    direction: 2,
    prompt: "{角色描述}，攻击动作动画，第{frame}帧",
  },
  jump: {
    frames: 4,
    direction: 2,
    prompt: "{角色描述}，跳跃动作动画，第{frame}帧",
  },
  hurt: {
    frames: 1,
    direction: 2,
    prompt: "{角色描述}，受击反馈动画",
  },
  death: {
    frames: 3,
    direction: 2,
    prompt: "{角色描述}，死亡消散动画",
  },
};

export const DIRECTION_LABELS: Record<2 | 4, string[]> = {
  2: ["右", "左"],
  4: ["下", "左", "右", "上"],
};
