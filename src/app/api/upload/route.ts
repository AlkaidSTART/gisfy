import { uploadRequestSchema } from "@/types";
import { fail, ok } from "@/lib/response";
import { uploadBase64ToQiniu } from "@/lib/qiniu";

function filenameFromId(id: string) {
  return `${id}_${Date.now()}.png`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = uploadRequestSchema.safeParse(json);
    if (!parsed.success) {
      return fail("invalid_params", parsed.error.issues[0]?.message || "参数错误", 400);
    }

    if (!process.env.QINIU_ACCESS_KEY) {
      return ok({
        urls: parsed.data.images.map((item) => ({
          id: item.id,
          cdnUrl: item.base64,
          size: Buffer.from(item.base64.replace(/^data:image\/png;base64,/, ""), "base64").length,
          mimeType: "image/png",
        })),
      });
    }

    const urls = await Promise.all(
      parsed.data.images.map(async (item) => {
        const uploaded = await uploadBase64ToQiniu({
          key: item.filename || filenameFromId(item.id),
          base64: item.base64,
        });

        return {
          id: item.id,
          cdnUrl: uploaded.cdnUrl,
          size: uploaded.size,
          mimeType: uploaded.mimeType,
        };
      }),
    );

    return ok({ urls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败";
    return fail("upload_failed", message, 500);
  }
}
