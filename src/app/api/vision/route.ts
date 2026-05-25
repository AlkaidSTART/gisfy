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
        model: process.env.VISION_MODEL || "qwen-vl-max",
        input: {
          messages: [
            {
              role: "user",
              content: [
                {
                  text: "分析这张参考图。请用中文简洁描述主体内容、美术风格、关键视觉特征。如果包含角色，描述姿态、装备、表情。控制在100字以内。",
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
      ? `参考图描述：${analysis}。用户想法：${userPrompt}。请综合这两者进行设计。`
      : `参考图描述：${analysis}。请基于此描述进行设计。`;

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
