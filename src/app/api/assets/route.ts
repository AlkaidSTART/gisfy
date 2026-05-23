import {
  assetSchema,
  assetsQuerySchema,
  deleteAssetSchema,
  generatedImageSchema,
} from "@/types";
import { fail, ok } from "@/lib/response";
import {
  deleteAsset,
  listAssets,
  upsertAssets,
} from "@/lib/store/assets-store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = assetsQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );

  if (!parsed.success) {
    return fail(
      "invalid_params",
      parsed.error.issues[0]?.message || "查询参数错误",
      400,
    );
  }

  const { page, limit, sort, style, type } = parsed.data;
  const userId = url.searchParams.get("userId") || "default";

  let assets = listAssets(userId);
  if (style) assets = assets.filter((a) => a.style === style);
  if (type) assets = assets.filter((a) => a.type === type);

  assets.sort((a, b) => {
    const diff = +new Date(a.createdAt) - +new Date(b.createdAt);
    return sort === "oldest" ? diff : -diff;
  });

  const total = assets.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const pageAssets = assets.slice(start, start + limit);

  return ok({
    assets: pageAssets,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const items = Array.isArray(json?.assets) ? json.assets : [];
    const userId = json?.userId || "default";

    const parsedItems = items.map((item: unknown) => {
      const generated = generatedImageSchema.parse(item);
      return assetSchema.parse({
        id: generated.id,
        cdnUrl: generated.url,
        prompt: generated.prompt,
        style: generated.style,
        type: generated.type,
        size: generated.size,
        seed: generated.seed,
        cost: generated.cost,
        duration: generated.duration,
        createdAt: new Date().toISOString(),
      });
    });

    upsertAssets(userId, parsedItems);
    return ok({ saved: parsedItems.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存失败";
    return fail("invalid_params", message, 400);
  }
}

export async function DELETE(req: Request) {
  try {
    const json = await req.json();
    const parsed = deleteAssetSchema.safeParse(json);
    if (!parsed.success) {
      return fail(
        "invalid_params",
        parsed.error.issues[0]?.message || "参数错误",
        400,
      );
    }

    const userId = json?.userId || "default";
    const removed = deleteAsset(userId, parsed.data.id);
    if (!removed) {
      return fail("not_found", "素材不存在", 404);
    }

    return ok({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除失败";
    return fail("delete_failed", message, 500);
  }
}
