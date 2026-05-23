import { createOpenAI } from "@ai-sdk/openai";
import { generateImage } from "ai";

export async function generateWithAli(input: {
  prompt: string;
  size: number;
  count: number;
  seed?: number;
}) {
  if (!process.env.ALI_API_KEY) {
    throw new Error("ALI_API_KEY is missing");
  }

  const aliyun = createOpenAI({
    apiKey: process.env.ALI_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });

  const modelName = process.env.ALI_MODEL || "wanx2.1";
  const startedAt = Date.now();

  const result = await generateImage({
    model: aliyun.image(modelName),
    prompt: input.prompt,
    size: `${input.size}x${input.size}`,
    n: input.count,
    providerOptions: input.seed ? { openai: { seed: input.seed } } : undefined,
  });

  const duration = (Date.now() - startedAt) / 1000;
  return {
    images: result.images,
    duration,
  };
}
