# GisFy — 技术设计文档 (TDD)

> 版本：v2.0
> 更新时间：2026-05-23
> 技术栈：Next.js 16 + React 19 + TypeScript 6 + TailwindCSS v4 + shadcn/ui v4 + Vercel AI SDK v6 + 阿里百炼 + 七牛 Kodo/CDN
> 开发周期：3 天

---

## 1. 系统架构

### 1.1 架构概览

```
┌─────────────────────────────────────────────────┐
│                  用户浏览器                        │
│     Next.js 16 前端（React 19 + TailwindCSS v4）  │
└────────────────────┬────────────────────────────┘
                     │ HTTP / Server Actions
                     ▼
┌─────────────────────────────────────────────────┐
│        Next.js 16 后端（App Router + Turbopack）  │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ 生成 API     │  │ 存储 API    │  │ 素材 API  │ │
│  │ /api/generate│  │ /api/upload │  │ /api/assets│ │
│  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │
└─────────┼───────────────┼────────────────┼───────┘
          │               │                │
          ▼               ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────────┐
   │阿里百炼   │    │七牛 Kodo │    │浏览器        │
   │通义万相   │    │对象存储   │    │localStorage  │
   │AI API    │    │+ CDN     │    │（素材历史）    │
   └──────────┘    └──────────┘    └──────────────┘
```

### 1.2 技术选型（2026年5月最新）

| 层级 | 技术 | 版本 | 选择理由 |
| :--- | :--- | :--- | :--- |
| **前端框架** | Next.js | **16.2.6** | Turbopack 默认构建器，HMR < 50ms，React Compiler 内置 |
| **UI 框架** | React | **19.2.6** | Server Actions、use() Hook、Actions 原生支持异步状态 |
| **类型系统** | TypeScript | **6.0** | Go 重写后 10x 类型检查速度，Project Corsa |
| **CSS 框架** | TailwindCSS | **v4.3.0** | CSS-first 配置，零 PostCSS 依赖，内置编译器 |
| **组件库** | shadcn/ui | **v4.7.0** | CLI v4，支持 preset 命令和 package imports |
| **AI SDK** | Vercel AI SDK | **v6.0.189** | 稳定版，流式生成 + 类型安全 |
| **AI 模型** | 阿里百炼通义万相 | — | 最便宜国产模型，¥0.001/次 |
| **对象存储** | 七牛 Kodo | — | 黑客松白嫖 10GB 免费额度 |
| **CDN** | 七牛 CDN | — | 10GB/月免费流量 |
| **图像处理** | sharp | — | 高性能 PNG/Buffer 处理 |
| **部署** | Vercel | — | 原生 Next.js 支持，免费额度 |

---

## 2. 项目目录结构

```
gisfy/
├── app/
│   ├── layout.tsx              # 全局布局（Header + Footer）
│   ├── page.tsx                # 首页/生成页（React Server Component）
│   ├── history/
│   │   └── page.tsx            # 素材历史页
│   └── api/
│       ├── generate/
│       │   └── route.ts        # AI 生成 API
│       ├── upload/
│       │   └── route.ts        # 七牛上传 API
│       └── assets/
│           └── route.ts        # 素材 CRUD API
├── components/
│   ├── Generator.tsx           # 生成器主组件（客户端组件）
│   ├── StyleSelector.tsx       # 风格选择器
│   ├── PromptEditor.tsx        # Prompt 编辑器 + 模板
│   ├── Preview.tsx             # 素材预览组件
│   ├── SpritesheetEditor.tsx   # Spritesheet 合成
│   └── AssetCard.tsx           # 素材卡片
├── lib/
│   ├── ali.ts                  # 阿里百炼 API 封装
│   ├── qiniu.ts                # 七牛 SDK 封装
│   ├── spritesheet.ts          # Spritesheet 合成逻辑
│   └── prompt-templates.ts     # Prompt 模板库
├── types/
│   └── index.ts                # TypeScript 6 类型定义
├── public/
├── .env.local
├── next.config.ts              # Next.js 16 配置
├── tailwind.config.ts          # TailwindCSS v4 CSS-first 配置
└── package.json
```

---

## 3. API 设计

### 3.1 POST /api/generate — AI 生成素材

```
请求体：
{
  "prompt": "一个手持长剑的武士",
  "style": "pixel",
  "type": "character",
  "size": 256,
  "count": 1,
  "seed": 42,
  "negativePrompt": "模糊,低质量,锯齿"
}

响应 200：
{
  "success": true,
  "data": {
    "images": [{
      "id": "gisfy_xxxxx",
      "url": "data:image/png;base64,...",
      "prompt": "...",
      "style": "pixel",
      "type": "character",
      "size": 256,
      "seed": 42,
      "cost": 0.001,
      "duration": 2.3,
      "cached": false
    }]
  }
}
```

### 3.2 POST /api/upload — 上传到七牛
```
请求体：{ "images": [{ "id", "base64", "filename", "metadata" }] }
响应：{ "success": true, "data": { "urls": [{ "id", "cdnUrl", "size" }] } }
```

### 3.3 GET /api/assets — 素材历史
```
查询：?page=1&limit=20&style=pixel
响应：{ "success": true, "data": { "assets": [...], "pagination": {...} } }
```

### 3.4 DELETE /api/assets — 删除素材
```
请求体：{ "id": "gisfy_xxxxx" }
响应：{ "success": true }
```

---

## 4. 阿里百炼集成

### 4.1 模型选择

| 模型 | 特点 | 成本 | MVP |
| :--- | :--- | :--- | :--- |
| wanx | 文生图基础版 | ¥0.001/次 | ✅ 默认 |
| wanx2.1 | 画质更好 | ¥0.002/次 | ⭐ 推荐 |
| wanx-lite | 极速轻量版 | ¥0.0005/次 | 可选备用 |

### 4.2 Prompt 模板策略

```typescript
const STYLE_PREFIX = {
  pixel:  "像素风格，16-bit 游戏画面，块状边缘，低分辨率，透明背景，",
  flat:   "扁平矢量风格，纯色块，简洁线条，无渐变，透明背景，",
  anime:  "日系动漫风格，勾线清晰，柔和上色，大眼睛，透明背景，",
};
const TYPE_TEMPLATES = {
  character: "{描述}，全身站立，正面视角，游戏角色素材",
  monster:   "{描述}，站立姿态，游戏怪物素材",
  scene:     "{描述}，横向构图，游戏场景背景素材",
  tile:      "{描述}，正方形瓦片，可无缝拼接，游戏地图素材",
  item:      "{描述}，居中展示，游戏道具图标",
  ui:        "{描述}，游戏UI元素，透明背景",
  effect:    "{描述}，透明背景，游戏特效序列帧素材",
};
```

---

## 5. 七牛云集成

### 免费额度

| 服务 | 免费额度 |
| :--- | :--- |
| Kodo 存储 | 10GB（10万张图） |
| CDN 流量 | 10GB/月 |
| 请求次数 | 100万次/月 |

### 文件命名
```
{type}_{style}_{timestamp8}_{hash4}.png
示例：character_pixel_05231234_a1b2.png
```

---

## 6. Spritesheet 合成

```typescript
// 使用 sharp 合成多帧为精灵图
// 输出兼容 Unity / Godot 的 JSON 帧信息
```

输出 JSON 格式：
```json
{
  "frames": { "walk_0.png": { "frame": { "x": 0, "y": 0, "w": 64, "h": 64 } } },
  "meta": { "image": "spritesheet.png", "size": { "w": 262, "h": 64 }, "cols": 4 }
}
```

---

## 7. 数据结构

```typescript
interface Asset {
  id: string;
  cdnUrl: string;
  style: 'pixel' | 'flat' | 'anime';
  type: AssetType;
  size: 64 | 128 | 256 | 512;
  prompt: string;
  seed?: number;
  cost: number;
  duration: number;
  createdAt: string;
}
type AssetType = 'character' | 'monster' | 'scene' | 'tile' | 'item' | 'ui' | 'effect';
```

---

## 8. Next.js 16 新特性

| 特性 | 应用 |
| :--- | :--- |
| Turbopack 默认 | HMR < 50ms |
| React Compiler | 自动记忆化 |
| Server Actions | 表单直接调服务端 |
| Partial Prerendering | 静态+动态混合 |
| proxy.ts | 统一转发配置 |

---

## 9. 开发计划

| 天 | 上午 | 下午 | 晚上 |
| :- | :--- | :--- | :--- |
| Day 1 | 初始化 Next.js 16 + Turbopack | 前端页面布局 | 阿里百炼 SDK 封装 |
| Day 2 | AI 生成接口打通 | 生成流程闭环 | 七牛上传+CDN |
| Day 3 | Spritesheet 合成 | 历史+下载+缓存 | 演示+部署 |

---

## 10. 关键依赖

```json
{
  "next": "^16.2.6",
  "react": "^19.2.6",
  "ai": "^6.0.189",
  "sharp": "^0.34.0",
  "qiniu": "^7.10.0",
  "zod": "^4.0.0"
}
```

```bash
# 环境变量
ALI_API_KEY=sk-xxx
ALI_MODEL=wanx2.1
QINIU_ACCESS_KEY=xxx
QINIU_SECRET_KEY=xxx
QINIU_BUCKET=gisfy-assets
QINIU_DOMAIN=https://cdn.gisfy.com
```