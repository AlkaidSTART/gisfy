import { uploadRequestSchema } from "@/types";
import { fail, ok } from "@/lib/response";
import { uploadToSupabase } from "@/lib/supabase-storage";

function filenameFromId(id: string) {
  return `${id}_${Date.now()}.png`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = uploadRequestSchema.safeParse(json);
    if (!parsed.success) {
      return fail(
        "invalid_params",
        parsed.error.issues[0]?.message || "参数错误",
        400,
      );
    }

    // If Supabase isn't configured, return base64 as-is
    if (!process.env.SUPABASE_URL) {
      return ok({
        urls: parsed.data.images.map((item) => ({
          id: item.id,
          cdnUrl: item.base64,
          size: Buffer.from(
            item.base64.replace(/^data:image\/\w+;base64,/, ""),
            "base64",
          ).length,
          mimeType: "image/png",
        })),
      });
    }

    const urls = await Promise.all(
      parsed.data.images.map(async (item) => {
        const uploaded = await uploadToSupabase({
          id: item.id,
          base64: item.base64,
          filename: item.filename || filenameFromId(item.id),
        });
        return {
          id: uploaded.id,
          cdnUrl: uploaded.cdnUrl,
          size: uploaded.size,
          mimeType: "image/png",
        };
      }),
    );

    return ok({ urls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败";
    return fail("upload_failed", message, 500);
  }
}
