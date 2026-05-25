import type { AssetType, Style, GenerateRequest } from "@/types";

const STYLE_PREFIX: Record<Style, string> = {
  pixel: "像素风格，16-bit 游戏画面，块状边缘，低分辨率，透明背景，",
  flat: "扁平矢量风格，纯色块，简洁线条，无渐变，透明背景，",
  anime: "日系动漫风格，勾线清晰，柔和上色，大眼睛，透明背景，",
};

const TYPE_TEMPLATES: Record<AssetType, string> = {
  character: "{描述}，全身站立，正面视角，游戏角色素材",
  monster: "{描述}，站立姿态，游戏怪物素材",
  scene: "{描述}，横向构图，游戏场景背景素材",
  tile: "{描述}，正方形瓦片，可无缝拼接，游戏地图素材",
  item: "{描述}，居中展示，游戏道具图标",
  ui: "{描述}，游戏UI元素，透明背景",
  effect: "{描述}，透明背景，游戏特效序列帧素材",
};

export function buildPrompt(
  input: Partial<GenerateRequest> & {
    prompt: string;
    style: Style;
    type: AssetType;
  },
) {
  const styled = `${STYLE_PREFIX[input.style]}${TYPE_TEMPLATES[input.type].replace("{描述}", input.prompt)}`;
  return {
    prompt: styled,
    negativePrompt: input.negativePrompt ?? "",
  };
}
