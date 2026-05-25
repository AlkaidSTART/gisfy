import { fail, ok } from "@/lib/response";

const DASHSCOPE_MM_BASE =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const userPrompt = (formData.get("prompt") as string) || "";

    if (!imageFile) return fail("invalid_params", "请上传参考图片", 400);

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = imageFile.type || "image/png";

    const apiKey = process.env.ALI_API_KEY;
    if (!apiKey) return fail("no_api_key", "未配置 API Key", 500);

    const res = await fetch(DASHSCOPE_MM_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.VISION_MODEL || "qwen3-vl-flash",
        input: {
          messages: [
            {
              role: "user",
              content: [
                {
                  text: [
                    "你是资深游戏美术设定分析师。请只根据图片可见信息做高精度视觉识别，不要编造看不见的细节。",
                    "目标是让后续文生图尽可能复刻同一角色/物体的视觉身份。",
                    "请按以下维度输出中文描述：",
                    "1. 主体类型与数量；",
                    "2. 美术风格和渲染方式；",
                    "3. 轮廓体型、头身比、姿态和朝向；",
                    "4. 发型/头部特征/表情；",
                    "5. 服装、装备、武器、配件；",
                    "6. 主色、辅色、材质和纹理；",
                    "7. 明确需要保持一致的视觉锚点；",
                    "8. 不确定项请标注“无法确认”。",
                    "输出 160 字以内，优先具体名词和颜色，不要写解释性废话。",
                  ].join("\n"),
                },
                { image: `data:${mimeType};base64,${base64}` },
              ],
            },
          ],
        },
        parameters: {
          result_format: "message",
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[vision] dashscope error:", res.status, errorText);
      return fail("vision_failed", `DashScope API ${res.status}`, 500);
    }

    const data = await res.json();
    const analysis =
      data?.output?.choices?.[0]?.message?.content?.[0]?.text?.trim();

    if (!analysis) {
      console.error(
        "[vision] unexpected response:",
        JSON.stringify(data).slice(0, 500),
      );
      return fail("vision_failed", "未获取到视觉分析结果", 500);
    }

    const contextPrompt = userPrompt
      ? `参考图高精度视觉描述：${analysis}。用户想法：${userPrompt}。生成时必须保持参考图的主体身份、配色、服装/装备、轮廓体型和美术风格一致，只改变用户要求的动作或内容。`
      : `参考图高精度视觉描述：${analysis}。生成时必须保持参考图的主体身份、配色、服装/装备、轮廓体型和美术风格一致。`;

    return ok({
      analysis,
      contextPrompt,
      referenceUrl: `data:${mimeType};base64,${base64}`,
    });
  } catch (error) {
    console.error("[vision] error:", error);
    const message =
      error instanceof Error ? error.message : String(error) || "视觉识别失败";
    return fail("vision_failed", message || "视觉识别失败", 500);
  }
}
