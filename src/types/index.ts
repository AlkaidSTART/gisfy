import { z } from "zod";

export const styleSchema = z.enum(["pixel", "flat", "anime"]);
export const assetTypeSchema = z.enum([
  "character",
  "monster",
  "scene",
  "tile",
  "item",
  "ui",
  "effect",
]);
export const assetSizeSchema = z.union([
  z.literal(512),
  z.literal(1024),
  z.literal(2048),
]);
export const assetCountSchema = z.union([
  z.literal(1),
  z.literal(4),
  z.literal(9),
]);

export const generateRequestSchema = z.object({
  prompt: z.string().min(1).max(300),
  style: styleSchema,
  type: assetTypeSchema,
  size: assetSizeSchema.default(256),
  count: assetCountSchema.default(1),
  transparent: z.boolean().default(true),
  seed: z.number().int().optional(),
  negativePrompt: z.string().max(300).optional().default(""),
});

export const generatedImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  prompt: z.string(),
  style: styleSchema,
  type: assetTypeSchema,
  size: assetSizeSchema,
  seed: z.number().int().optional(),
  cost: z.number(),
  duration: z.number(),
  cached: z.boolean(),
});

export const uploadImageSchema = z.object({
  id: z.string(),
  base64: z.string().min(1),
  filename: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const uploadRequestSchema = z.object({
  images: z.array(uploadImageSchema).min(1),
});

export const uploadResultSchema = z.object({
  id: z.string(),
  cdnUrl: z.string(),
  size: z.number(),
  mimeType: z.string(),
});

export const assetSchema = z.object({
  id: z.string(),
  cdnUrl: z.string(),
  prompt: z.string(),
  style: styleSchema,
  type: assetTypeSchema,
  size: assetSizeSchema,
  seed: z.number().int().optional(),
  cost: z.number(),
  duration: z.number(),
  createdAt: z.string(),
});

export const assetsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  style: styleSchema.optional(),
  type: assetTypeSchema.optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});

export const deleteAssetSchema = z.object({ id: z.string().min(1) });

export const animationTemplateSchema = z.enum([
  "idle",
  "walk",
  "attack",
  "jump",
  "hurt",
  "death",
]);

export const animationDirectionSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(4),
]);

export const generateSequenceRequestSchema = z.object({
  prompt: z.string().min(1).max(300),
  style: styleSchema,
  size: assetSizeSchema.default(256),
  template: animationTemplateSchema,
  direction: animationDirectionSchema.default(1),
  transparent: z.boolean().default(true),
  seed: z.number().int().optional(),
  negativePrompt: z.string().max(300).optional().default(""),
});

export const spritesheetFormatSchema = z.enum([
  "texturepacker-array",
  "aseprite",
  "phaser",
  "strip",
  "grid",
]);

export const spritesheetConfigSchema = z.object({
  assetIds: z.array(z.string()).min(1).max(64),
  format: spritesheetFormatSchema.default("texturepacker-array"),
  columns: z.number().int().min(1).max(16).optional(),
  padding: z.number().int().min(0).max(8).default(1),
  name: z.string().min(1).max(64).default("spritesheet"),
});

export type Style = z.infer<typeof styleSchema>;
export type AssetType = z.infer<typeof assetTypeSchema>;
export type Asset = z.infer<typeof assetSchema>;
export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type GeneratedImage = z.infer<typeof generatedImageSchema>;
export type UploadRequest = z.infer<typeof uploadRequestSchema>;
export type SpritesheetConfig = z.infer<typeof spritesheetConfigSchema>;
export type AnimationTemplate = z.infer<typeof animationTemplateSchema>;
export type GenerateSequenceRequest = z.infer<
  typeof generateSequenceRequestSchema
>;

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = {
  success: false;
  error: { code: string; message: string };
};

// ─── Async Task ─────────────────────────────────────

export type TaskStatus =
  | "queued"
  | "processing"
  | "uploading"
  | "completed"
  | "failed";

export interface GenerateTask {
  taskId: string;
  status: TaskStatus;
  progress: number;
  prompt: string;
  style: Style;
  type: AssetType;
  createdAt: string;
  images?: Array<{
    id: string;
    url: string;
    prompt: string;
    style: Style;
    type: AssetType;
    size: number;
  }>;
  error?: string;
}

export interface SequenceTaskInfo {
  taskId: string;
  frame: number;
  direction: number;
  directionLabel: string;
  prompt: string;
}

// ─── Auth ────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export const registerBodySchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(50),
  password: z.string().min(6).max(100),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
