import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { fail, ok } from "@/lib/response";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const userPrompt = (formData.get("prompt") as string) || "";

    if (!imageFile) return fail("invalid_params", "请上传参考图片", 400);

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = imageFile.type || "image/png";
    const dataUri = `data:${mimeType};base64,${base64}`;

    const aliyun = createOpenAI({
      apiKey: process.env.ALI_API_KEY || "",
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    const { text: analysis } = await generateText({
      model: aliyun("qwen-vl-max"),
      system: `你是一个专业的游戏美术分析助手。分析上传的参考图片，用中文简洁描述：
1. 主体内容（角色/场景/道具等）
2. 美术风格（像素/扁平/日系等）
3. 关键视觉特征（配色、构图、细节）
4. 如果是角色：姿态、装备、表情
回答控制在100字以内，只输出描述本身。`,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "分析这张参考图：" },
            { type: "image", image: dataUri },
          ],
        },
      ],
    });

    const contextPrompt = userPrompt
      ? `参考图描述：${analysis.trim()}。用户想法：${userPrompt}。请综合这两者进行设计。`
      : `参考图描述：${analysis.trim()}。请基于此描述进行设计。`;

    return ok({
      analysis: analysis.trim(),
      contextPrompt,
      referenceUrl: dataUri,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "视觉识别失败";
    return fail("vision_failed", message, 500);
  }
}
