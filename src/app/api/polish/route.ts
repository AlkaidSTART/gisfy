import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { prompt, mode } = await req.json();

    const aliyun = createOpenAI({
      apiKey: process.env.ALI_API_KEY || '',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    const systemPrompt = `你是一个专业的AI 2D游戏素材提示词润色大师。
用户的原始输入: ${prompt}
请求模式: ${mode === 'form' ? '表单关键词拼接' : '口语化文本'}

任务：
请将用户的原始输入扩写、润色为一段高度专业、结构化的一段英文画面描述（用于Stable Diffusion等图像生成大模型）。
确保加入合适的画质词语（如 masterpeice, best quality, highres），如果用户提到了特定风格，保留风格并增强细节。不需要给出多余的解释，直接回复润色后的英文提示词即可。`;

    const { text } = await generateText({
      model: aliyun(process.env.ALI_MODEL || 'qwen-turbo'),
      system: systemPrompt,
      prompt: "请提供润色后的英文提示词。",
    });

    return new Response(JSON.stringify({ success: true, polishedPrompt: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Polish API Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
