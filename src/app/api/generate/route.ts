import { generateRequestSchema } from "@/types";
import { fail, ok } from "@/lib/response";
import { startGenerationTask } from "@/lib/generation";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = generateRequestSchema.safeParse(json);
    if (!parsed.success) {
      return fail(
        "invalid_params",
        parsed.error.issues[0]?.message || "参数错误",
        400,
      );
    }

    const body = parsed.data;
    const userId = (json as { userId?: string }).userId || "default";
    const taskId = startGenerationTask(body, userId);

    return ok({ taskId, status: "queued" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    return fail("generate_failed", message, 500);
  }
}
