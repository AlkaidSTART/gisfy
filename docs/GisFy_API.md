# GisFy — API 接口文档

> 版本：v1.0
> 更新时间：2026-05-23
> 基础地址：`https://gisfy.vercel.app/api`
> 数据格式：`application/json`

---

## 目录

1. [生成素材 — POST /api/generate](#1)
2. [上传七牛 — POST /api/upload](#2)
3. [素材历史 — GET /api/assets](#3)
4. [删除素材 — DELETE /api/assets](#4)
5. [错误码说明](#5)
6. [前端集成示例](#6)

---

## 1. 生成素材

> 核心接口：用户输入 prompt，AI 生成 2D 游戏素材

**端点：** `POST /api/generate`

### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `prompt` | string | ✅ | — | 用户描述，支持中英文 |
| `style` | string | ✅ | — | `pixel` / `flat` / `anime` |
| `type` | string | ✅ | — | `character` / `monster` / `scene` / `tile` / `item` / `ui` / `effect` |
| `size` | number | ❌ | `256` | `64` / `128` / `256` / `512` |
| `count` | number | ❌ | `1` | `1` / `4` / `9` |
| `seed` | number | ❌ | 随机 | 固定后可复现相同结果 |
| `negativePrompt` | string | ❌ | `""` | 排除不想要的元素 |

### 请求示例

```json
{
  "prompt": "一个手持圣剑的精灵骑士，银色盔甲",
  "style": "anime",
  "type": "character",
  "size": 256,
  "count": 1,
  "seed": 42,
  "negativePrompt": "模糊,低质量,水印"
}
```

### 响应示例

**成功 200：**
```json
{
  "success": true,
  "data": {
    "images": [{
      "id": "gisfy_a1b2c3d4",
      "url": "data:image/png;base64,...",
      "prompt": "一个手持圣剑的精灵骑士，银色盔甲",
      "style": "anime",
      "type": "character",
      "size": 256,
      "seed": 42,
      "cost": 0.001,
      "duration": 2.35,
      "cached": false
    }]
  }
}
```

**限流 429：**
```json
{
  "success": false,
  "error": "rate_limit",
  "message": "请求过于频繁，请 5 秒后再试",
  "retryAfter": 5
}
```

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | string | 唯一素材 ID，格式 `gisfy_{随机8位}` |
| `url` | string | base64 图片数据，可直接用于 `<img src>` |
| `cost` | number | 本次生成费用（元） |
| `duration` | number | 生成耗时（秒） |
| `cached` | boolean | 是否为缓存结果（缓存不收费） |

---

## 2. 上传七牛

> 将生成的素材持久化存储到七牛 Kodo，返回 CDN 加速 URL

**端点：** `POST /api/upload`

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `images` | array | ✅ | 图片数组 |
| `images[].id` | string | ✅ | 素材 ID |
| `images[].base64` | string | ✅ | base64 图片数据 |
| `images[].filename` | string | ✅ | 文件名 |
| `images[].metadata` | object | ❌ | 附加元数据 |

### 响应示例

```json
{
  "success": true,
  "data": {
    "urls": [{
      "id": "gisfy_a1b2c3d4",
      "cdnUrl": "https://cdn.gisfy.com/assets/elf_knight_anime_001.png",
      "size": 24576,
      "mimeType": "image/png"
    }]
  }
}
```

### 命名规范

```
{type}_{style}_{timestamp8}_{hash4}.png
示例：character_pixel_05231234_a1b2.png
```

---

## 3. 素材历史

**端点：** `GET /api/assets`

### 查询参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `page` | number | ❌ | `1` | 页码 |
| `limit` | number | ❌ | `20` | 每页数量（最大 50） |
| `style` | string | ❌ | — | 按风格筛选 |
| `type` | string | ❌ | — | 按素材类型筛选 |
| `sort` | string | ❌ | `newest` | `newest` / `oldest` |

### 响应示例

```json
{
  "success": true,
  "data": {
    "assets": [{
      "id": "gisfy_a1b2c3d4",
      "cdnUrl": "https://cdn.gisfy.com/assets/...",
      "prompt": "一个手持圣剑的精灵骑士",
      "style": "anime",
      "type": "character",
      "size": 256,
      "seed": 42,
      "cost": 0.001,
      "duration": 2.35,
      "createdAt": "2026-05-23T12:00:00.000Z"
    }],
    "pagination": {
      "page": 1, "limit": 20, "total": 42,
      "totalPages": 3, "hasMore": true
    }
  }
}
```

---

## 4. 删除素材

**端点：** `DELETE /api/assets`

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | string | ✅ | 要删除的素材 ID |

### 请求示例

```json
{ "id": "gisfy_a1b2c3d4" }
```

### 响应

```json
{ "success": true }
```

---

## 5. 错误码说明

| 状态码 | error | 说明 | 处理方式 |
| :--- | :--- | :--- | :--- |
| 400 | `invalid_params` | 参数不合法 | 检查必填字段 |
| 400 | `invalid_style` | 不支持风格 | pixel/flat/anime |
| 400 | `invalid_type` | 不支持类型 | 参考 type 枚举 |
| 401 | `unauthorized` | API Key 无效 | 检查 ALI_API_KEY |
| 429 | `rate_limit` | 频率过高 | 等待后重试 |
| 500 | `generate_failed` | AI 生成失败 | 稍后重试 |
| 500 | `upload_failed` | 七牛上传失败 | 检查七牛配置 |
| 503 | `service_unavailable` | 服务不可用 | 稍后再试 |

### 全局结构

```
成功: { "success": true,  "data": {...} }
失败: { "success": false, "error": "...", "message": "..." }
```

---

## 6. 前端集成示例

### 使用 fetch

```typescript
async function generateAsset(params) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

const result = await generateAsset({
  prompt: '一个红色药水，发光效果',
  style: 'pixel',
  type: 'item',
  size: 128,
});
```

### 使用 Server Actions（Next.js 16 推荐）

```typescript
'use server';
import { z } from 'zod';

const schema = z.object({
  prompt: z.string().min(1).max(200),
  style: z.enum(['pixel', 'flat', 'anime']),
  type: z.enum(['character', 'monster', 'scene', 'tile', 'item', 'ui', 'effect']),
  size: z.number().optional().default(256),
});

export async function generateAssetAction(formData: FormData) {
  const parsed = schema.parse({ /* ... */ });
  return await generateImage(parsed);
}
```

### 下载素材

```typescript
function downloadAsset(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
```