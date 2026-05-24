import sharp from "sharp";
import type { SpritesheetConfig } from "@/types";

type PackedFrame = {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type PackedMeta = {
  image: string;
  size: { w: number; h: number };
  frameCount: number;
  cols: number;
  rows: number;
};

type PackedResult = {
  pngBuffer: Buffer;
  frames: PackedFrame[];
  meta: PackedMeta;
};

async function loadPngBuffer(url: string) {
  if (url.startsWith("data:image")) {
    const pureBase64 = url.replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(pureBase64, "base64");
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`图片下载失败: ${url}`);
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

function calcLayout(
  total: number,
  config: Pick<SpritesheetConfig, "format" | "columns">,
) {
  const cols =
    config.format === "strip"
      ? total
      : config.columns
        ? Math.min(config.columns, total)
        : Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  return { cols, rows };
}

export async function packSpritesheet(
  images: Array<{ id: string; url: string }>,
  config: SpritesheetConfig,
): Promise<PackedResult> {
  if (images.length === 0) throw new Error("素材为空");
  const padding = config.padding ?? 1;

  const loaded = await Promise.all(
    images.map(async (img) => {
      const buffer = await loadPngBuffer(img.url);
      const metadata = await sharp(buffer).metadata();
      return {
        id: img.id,
        buffer,
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
      };
    }),
  );

  const baseWidth = loaded[0].width;
  const baseHeight = loaded[0].height;
  if (!baseWidth || !baseHeight) throw new Error("图片尺寸无效");
  if (loaded.some((img) => img.width !== baseWidth || img.height !== baseHeight)) {
    throw new Error("Spritesheet 仅支持同尺寸图片");
  }

  const { cols, rows } = calcLayout(loaded.length, config);
  const sheetWidth = cols * baseWidth + (cols - 1) * padding;
  const sheetHeight = rows * baseHeight + (rows - 1) * padding;

  const composite = loaded.map((img, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      input: img.buffer,
      left: col * (baseWidth + padding),
      top: row * (baseHeight + padding),
    };
  });

  const frames = loaded.map((img, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      name: img.id,
      x: col * (baseWidth + padding),
      y: row * (baseHeight + padding),
      w: baseWidth,
      h: baseHeight,
    };
  });

  const pngBuffer = await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composite)
    .png()
    .toBuffer();

  return {
    pngBuffer,
    frames,
    meta: {
      image: `${config.name}.png`,
      size: { w: sheetWidth, h: sheetHeight },
      frameCount: frames.length,
      cols,
      rows,
    },
  };
}

export function exportSpritesheetJson(
  format: SpritesheetConfig["format"],
  frames: PackedFrame[],
  meta: PackedMeta,
) {
  if (format === "aseprite") {
    return {
      frames: Object.fromEntries(
        frames.map((f) => [
          f.name,
          { frame: { x: f.x, y: f.y, w: f.w, h: f.h }, duration: 100 },
        ]),
      ),
      meta: { app: "GisFy", image: meta.image, size: meta.size },
    };
  }

  if (format === "strip" || format === "grid") {
    return {
      frames: frames.map((f) => ({ name: f.name, x: f.x, y: f.y, w: f.w, h: f.h })),
      meta: { image: meta.image, size: meta.size, cols: meta.cols, rows: meta.rows },
    };
  }

  return {
    frames: Object.fromEntries(
      frames.map((f) => [f.name, { frame: { x: f.x, y: f.y, w: f.w, h: f.h } }]),
    ),
    meta: { image: meta.image, size: meta.size, format },
  };
}
