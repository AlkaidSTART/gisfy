import { randomUUID } from "node:crypto";
import { generateRequestSchema, generatedImageSchema } from "@/types";
import { buildPrompt } from "@/lib/prompt-templates";
import { fail, ok } from "@/lib/response";
import { generateWithAli } from "@/lib/ali";

function mockBase64Png() {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2Z8VkAAAAASUVORK5CYII=";
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = generateRequestSchema.safeParse(json);
    if (!parsed.success) {
      return fail("invalid_params", parsed.error.issues[0]?.message || "参数错误", 400);
    }

    const body = parsed.data;
    const built = buildPrompt(body);
    const startedAt = Date.now();

    if (!process.env.ALI_API_KEY) {
      const mockImages = Array.from({ length: body.count }).map(() => ({
        id: `gisfy_${randomUUID().slice(0, 8)}`,
        url: mockBase64Png(),
        prompt: body.prompt,
        style: body.style,
        type: body.type,
        size: body.size,
        seed: body.seed,
        cost: 0,
        duration: (Date.now() - startedAt) / 1000,
        cached: false,
      }));
      return ok({ images: mockImages });
    }

    const aiResult = await generateWithAli({
      prompt: built.prompt,
      size: body.size,
      count: body.count,
      seed: body.seed,
    });

    const images = aiResult.images.map((img) => {
      const candidate = {
        id: `gisfy_${randomUUID().slice(0, 8)}`,
        url: img.base64
          ? `data:image/png;base64,${img.base64}`
          : (img.uint8Array ? `data:image/png;base64,${Buffer.from(img.uint8Array).toString("base64")}` : ""),
        prompt: body.prompt,
        style: body.style,
        type: body.type,
        size: body.size,
        seed: body.seed,
        cost: Number((0.001 * body.count).toFixed(3)),
        duration: aiResult.duration,
        cached: false,
      };
      return generatedImageSchema.parse(candidate);
    });

    return ok({ images });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    return fail("generate_failed", message, 500);
  }
}
