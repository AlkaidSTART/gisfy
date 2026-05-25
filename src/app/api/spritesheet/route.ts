import { randomUUID } from "node:crypto";
import { spritesheetConfigSchema } from "@/types";
import { fail, ok } from "@/lib/response";
import { getAssetsByIds } from "@/lib/asset-repo";
import { exportSpritesheetJson, packSpritesheet } from "@/lib/spritesheet";
import { uploadToSupabase } from "@/lib/supabase-storage";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = spritesheetConfigSchema.safeParse(json);
    if (!parsed.success) {
      return fail(
        "invalid_params",
        parsed.error.issues[0]?.message || "参数错误",
        400,
      );
    }

    const body = parsed.data;
    const userId = (json as { userId?: string }).userId || "default";
    const assets = await getAssetsByIds(userId, body.assetIds);
    if (assets.length !== body.assetIds.length) {
      return fail("not_found", "部分素材不存在", 404);
    }

    const packed = await packSpritesheet(
      assets.map((a) => ({ id: a.id, url: a.cdnUrl })),
      body,
    );
    const jsonPayload = exportSpritesheetJson(body.format, packed.frames, packed.meta);
    const jsonString = JSON.stringify(jsonPayload);
    const pngBase64 = `data:image/png;base64,${packed.pngBuffer.toString("base64")}`;

    let pngUrl = pngBase64;
    const jsonUrl = `data:application/json;base64,${Buffer.from(jsonString, "utf-8").toString("base64")}`;

    if (process.env.SUPABASE_URL) {
      const suffix = randomUUID().slice(0, 8);
      const uploadedPng = await uploadToSupabase({
        id: `${body.name}_${suffix}`,
        base64: pngBase64,
        filename: `${body.name}_${suffix}.png`,
      });
      pngUrl = uploadedPng.cdnUrl;
    }

    return ok({
      pngUrl,
      jsonUrl,
      json: jsonPayload,
      frameCount: packed.meta.frameCount,
      sheetSize: packed.meta.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "spritesheet 生成失败";
    return fail("spritesheet_failed", message, 500);
  }
}
