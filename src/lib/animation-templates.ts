import type { AnimationTemplate } from "@/types";

export type AnimationTemplateConfig = {
  frames: number;
  direction: 1 | 2 | 4;
  prompt: string;
  phases: string[];
};

export const ANIMATION_TEMPLATES: Record<
  AnimationTemplate,
  AnimationTemplateConfig
> = {
  idle: {
    frames: 3,
    direction: 1,
    prompt: "{角色描述}，待机呼吸循环动画",
    phases: [
      "中立站姿，身体放松，双脚贴地，呼吸最低点",
      "身体轻微上浮，胸腔和肩膀小幅抬起，四肢保持原位",
      "身体回落到中立站姿，可无缝衔接第1帧",
    ],
  },
  walk: {
    frames: 4,
    direction: 1,
    prompt: "{角色描述}，四帧行走循环动画",
    phases: [
      "左脚向前接触地面，右脚在后，身体重心略低，摆臂自然反向",
      "身体经过中线向前移动，双腿交错，重心抬起",
      "右脚向前接触地面，左脚在后，姿态与第1帧左右相反",
      "身体再次经过中线，准备回到第1帧，可无缝循环",
    ],
  },
  attack: {
    frames: 3,
    direction: 1,
    prompt: "{角色描述}，三帧攻击动作动画",
    phases: [
      "攻击预备姿势，身体后撤蓄力，武器或手臂向后拉开",
      "攻击峰值姿势，武器或手臂快速挥出，身体前倾，动作幅度最大",
      "攻击收势姿势，身体回稳，武器或手臂完成挥动后自然落位",
    ],
  },
  jump: {
    frames: 3,
    direction: 1,
    prompt: "{角色描述}，三帧跳跃动作动画",
    phases: [
      "起跳压缩姿势，膝盖弯曲，身体下沉，双脚仍贴地",
      "空中最高点姿势，身体离地，腿部收起或伸展，重心最高",
      "落地缓冲姿势，双脚接触地面，膝盖弯曲吸收冲击",
    ],
  },
  hurt: {
    frames: 3,
    direction: 1,
    prompt: "{角色描述}，三帧受击反馈动画",
    phases: [
      "刚被击中，身体开始后仰，表情或姿态出现受击反应",
      "受击峰值，身体明显后仰或侧偏，四肢短暂失衡",
      "恢复姿势，身体回到接近中立站姿，准备衔接后续动作",
    ],
  },
  death: {
    frames: 3,
    direction: 1,
    prompt: "{角色描述}，三帧死亡倒下动画",
    phases: [
      "濒死失衡姿势，身体开始倒下或跪落",
      "倒下中段，身体大幅倾斜，轮廓压低，动作方向清晰",
      "倒地结束姿势，角色贴近地面或完全倒下，动作终止",
    ],
  },
};

export const DIRECTION_LABELS: Record<1 | 2 | 4, string[]> = {
  1: ["正面"],
  2: ["右", "左"],
  4: ["下", "左", "右", "上"],
};
