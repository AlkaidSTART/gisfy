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
  z.literal(64),
  z.literal(128),
  z.literal(256),
  z.literal(512),
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

export type Style = z.infer<typeof styleSchema>;
export type AssetType = z.infer<typeof assetTypeSchema>;
export type Asset = z.infer<typeof assetSchema>;
export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type GeneratedImage = z.infer<typeof generatedImageSchema>;
export type UploadRequest = z.infer<typeof uploadRequestSchema>;

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = {
  success: false;
  error: { code: string; message: string };
};

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
