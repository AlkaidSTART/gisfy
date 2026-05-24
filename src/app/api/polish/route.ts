import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { fail, ok } from "@/lib/response";

export async function POST(req: Request) {
  try {
    const { prompt, style, type } = (await req.json()) as {
      prompt: string;
      style?: string;
      type?: string;
    };

    if (!prompt?.trim()) {
      return fail("invalid_params", "请输入素材描述", 400);
    }

    const aliyun = createOpenAI({
      apiKey: process.env.ALI_API_KEY || "",
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    const styleMap: Record<string, string> = {
      pixel: "像素风 pixel art, 16-bit retro game sprite",
      flat: "扁平矢量风 flat vector art, minimalist clean",
      anime: "日系动漫风 anime cel-shaded style",
    };
    const styleHint = style ? `，风格方向: ${styleMap[style] || style}` : "";
    const typeHint = type ? `，素材类型: ${type}` : "";

    const systemPrompt = `你是专业游戏素材提示词工程师。将用户输入扩写为一段精炼的中文图像生成提示词。
规则：
1. 输出纯中文，80-200字
2. 包含画质关键词（ masterpiece, best quality, highres ）
3. 保留用户描述的所有关键元素并增强细节
4. 明确透明背景
5. 不要输出任何解释，只输出提示词本身
${styleHint}${typeHint}`;

    const { text } = await generateText({
      model: aliyun(process.env.ALI_MODEL || "qwen-turbo"),
      system: systemPrompt,
      prompt: `用户原始描述: ${prompt}\n请输出润色后的中文提示词：`,
      temperature: 0.7,
      maxOutputTokens: 300,
    });

    return ok({ polished: text.trim(), original: prompt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "润色失败";
    return fail("polish_failed", message, 500);
  }
}
