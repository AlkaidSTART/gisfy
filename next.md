# GisFy 下一阶段设计方案

> 6 个设计方向 · 按优先级排序 · 每个含技术方案 + 接口定义 + 文件规划
> 当前日期：2026-05-24 | 项目阶段：P0 完成 → P1 冲刺

---

## 当前状态速览

| 层级                              | 状态                               |
| :-------------------------------- | :--------------------------------- |
| 🔴 P0 文生图 + 风格 + 预览 + 存储 | ✅ 基本完成                        |
| 🟡 P1 Spritesheet                 | ❌ `src/lib/spritesheet.ts` 不存在 |
| 🟡 P1 Seed / 负面提示词 UI        | ❌ 类型定义有，UI 未暴露           |
| 🟡 P1 素材历史                    | ⚠️ 有基础列表，缺筛选/批量操作     |
| 🟢 P2 Tilemap / UI元素 / 特效     | ❌ 未开始                          |

---

## 1. Spritesheet / 精灵图集系统（P1 最高优先级）

### 1.1 功能概述

将多张同尺寸 PNG 拼合为一张大图 + JSON 帧元数据，支持主流 2D 引擎直接导入。

### 1.2 新增类型 (`src/types/index.ts`)

```ts
// Spritesheet 导出格式
export const spritesheetFormatSchema = z.enum([
  "texturepacker-array", // TexturePacker JSON Array (Unity/Godot/Phaser 通用)
  "aseprite", // Aseprite JSON (像素画工作流)
  "phaser", // Phaser/PixiJS 兼容格式
  "strip", // 水平动画条 (最简单)
  "grid", // 网格布局 (多方向)
]);

// Spritesheet 配置
export const spritesheetConfigSchema = z.object({
  assetIds: z.array(z.string()).min(1).max(64),
  format: spritesheetFormatSchema.default("texturepacker-array"),
  columns: z.number().int().min(1).max(16).optional(), // strip/grid 模式列数
  padding: z.number().int().min(0).max(8).default(1), // 帧间距
  name: z.string().min(1).max(64).default("spritesheet"),
});
```

### 1.3 核心库 (`src/lib/spritesheet.ts`)

**依赖**：`sharp`（已有依赖）用于图片拼接，`jszip` 需新增。

- `packSpritesheet(config)`：读取 N 张图片 → sharp composite 拼合 → 输出 PNG Buffer
- `generateMetadata(config)`：根据帧排列计算 `{x,y,w,h}` 元数据
- `exportAsFormat(buffer, meta, format)`：按不同 JSON 格式包装

三种输出格式的 JSON 结构设计：

| 格式                  | JSON 结构特点                                                                    | 目标引擎             |
| :-------------------- | :------------------------------------------------------------------------------- | :------------------- |
| `texturepacker-array` | `{ frames: { "name": { frame: {x,y,w,h} } }, meta: { size, image } }`            | Unity, Godot, Phaser |
| `aseprite`            | `{ frames: { "name": { frame: {x,y,w,h}, duration } }, meta: { app: "GisFy" } }` | Aseprite, Godot      |
| `strip` / `grid`      | `{ frames: [{ name, x, y, w, h }], meta: { cols, rows } }`                       | 自用 / 简单引擎      |

### 1.4 API 路由 (`src/app/api/spritesheet/route.ts`)

```
POST /api/spritesheet
Body: SpritesheetConfig
Response: { success: true, data: { pngUrl, jsonUrl, frameCount, sheetSize } }
```

- 从 assets-store 读取原图 URL → fetch 下载 → sharp 拼接 → 上传 Supabase → 返回 URL

### 1.5 前端组件 (`src/components/workspace/spritesheet-builder.tsx`)

- 从素材历史中多选素材（勾选 checkbox）
- 预览排列效果（Canvas 绘制简易预览网格）
- 导出按钮：下载 PNG + JSON（ZIP 打包）

### 1.6 新增依赖

`jszip` — 前端 ZIP 打包，`npm install jszip`

---

## 2. Seed / 负面提示词 UI（P1 基础设施）

### 2.1 功能概述

`src/types/index.ts` 中 `seed` / `negativePrompt` 字段已有定义，API 也接收，但 UI 未暴露。补齐即可。

### 2.2 修改文件

**`src/components/workspace/param-controls.tsx`** — 在现有分辨率 / 背景 / 增强控件下方新增：

| 控件            | 交互                                                             | 说明                                               |
| :-------------- | :--------------------------------------------------------------- | :------------------------------------------------- |
| **Seed 输入框** | 数字输入 + 🎲随机按钮 + 🔒锁定开关                               | 输入 `/api/generate` 的 `seed` 字段                |
| **锁定 Seed**   | toggle 开关                                                      | 锁定时，连续多次生成共享同一 seed → 保证帧间一致性 |
| **负面提示词**  | 文本框 + 快捷预设下拉                                            | 预设：`模糊, 畸形手指, 多余肢体, 低质量, 水印`     |
| **Prompt 快照** | 生成成功后自动保存 `{prompt, seed, style, type}` 到 localStorage | 侧边栏"历史快照"列表，点击一键回填                 |

### 2.3 状态管理

在 `src/lib/store/task-store.ts` 中新增：

```ts
// 快照接口
interface PromptSnapshot {
  id: string;
  prompt: string;
  seed?: number;
  style: string;
  type: string;
  createdAt: string;
}
```

---

## 3. 动画序列生成（P1 核心闭环）

### 3.1 功能概述

"为一个角色生成多帧动画，保持外观一致" — 这是独立游戏开发者的最大痛点。

### 3.2 动画模板 (`src/lib/animation-templates.ts`)

```ts
export const ANIMATION_TEMPLATES = {
  idle: {
    frames: 4,
    direction: 2,
    prompt: "{角色描述}，待机呼吸动画，轻微上下浮动",
  },
  walk: {
    frames: 6,
    direction: 4,
    prompt: "{角色描述}，行走循环动画，第{frame}帧",
  },
  attack: {
    frames: 5,
    direction: 2,
    prompt: "{角色描述}，攻击动作动画，第{frame}帧",
  },
  jump: {
    frames: 4,
    direction: 2,
    prompt: "{角色描述}，跳跃动作动画，第{frame}帧",
  },
  hurt: { frames: 2, direction: 2, prompt: "{角色描述}，受击反馈动画" },
  death: { frames: 4, direction: 2, prompt: "{角色描述}，死亡消散动画" },
};

export const DIRECTION_LABELS = {
  2: ["右", "左"], // 左右镜像
  4: ["下", "左", "右", "上"], // 标准 RPG 四方向
};
```

### 3.3 帧间一致性策略

- **固定 Seed**：所有帧共享同一个 `seed` → AI 生成结果风格一致
- **渐进式 Prompt**：每帧 prompt 仅改变动作描述，角色描述不变
- **自动镜像**：2 方向模式下，左方向可通过右方向水平翻转生成（零成本）

### 3.4 API 路由 (`src/app/api/generate/sequence/route.ts`)

```
POST /api/generate/sequence
Body: {
  prompt: string,          // 角色描述
  style: "pixel"|"flat"|"anime",
  size: 256,
  template: "walk",        // 动画模板名
  direction: 2|4,          // 方向数
  seed?: number,
  negativePrompt?: string
}
Response: { success: true, data: { sequenceId, tasks: TaskInfo[] } }
```

- 服务端按模板展开为 N 个独立生成任务，共享 seed
- 返回 `sequenceId` 用于后续查询进度和合成 spritesheet

### 3.5 前端组件 (`src/components/workspace/animation-builder.tsx`)

- 动画模板选择器（卡片式，6 种模板）
- 方向数切换（2 方向 / 4 方向）
- 帧预览网格（生成完成后展示所有帧）
- 一键生成 Spritesheet 按钮

---

## 4. 导出工程化（P1）

### 4.1 功能概述

开发者完成素材生成后，一键下载 ZIP 包，内含 PNG + JSON 元数据，按引擎格式组织。

### 4.2 导出包结构

```
{name}.zip
├── sprites/
│   ├── hero_idle_01.png
│   ├── hero_idle_02.png
│   └── ...
├── spritesheet.png              # 精灵图集大图
├── spritesheet.json             # 帧元数据
└── manifest.json                # { name, style, size, frameCount, generatedAt }
```

### 4.3 核心库 (`src/lib/export.ts`)

- `createExportPackage(assets, spritesheet, format)` — 用 JSZip 打包
- 前端执行或 API 端执行均可（小体量前端即可）

### 4.4 前端组件

在 `preview-card.tsx` 或生成结果区域增加按钮：

| 按钮            | 行为                             |
| :-------------- | :------------------------------- |
| 📥 下载 PNG     | 单张下载                         |
| 📦 导出 ZIP     | 当前所有结果 + spritesheet → ZIP |
| 🔗 复制 CDN URL | 复制到剪贴板                     |

### 4.5 新增依赖

`jszip`（与 spritesheet 共用一个） + `file-saver`（前端下载触发）

---

## 5. 素材管理增强（P1→P2）

### 5.1 当前状态

- `src/components/workspace/history-bar.tsx` — 横向滚动缩略图列表，无筛选、无批量操作
- `src/app/api/assets/route.ts` — 支持 `style`/`type`/`sort`/分页查询，但前端未接筛选 UI
- `src/lib/store/assets-store.ts` — 内存 Map，无持久化

### 5.2 设计方案

#### A. 筛选栏 (`history-bar.tsx` 顶部新增)

| 筛选器 | 类型      | 数据源                                          |
| :----- | :-------- | :---------------------------------------------- |
| 风格   | 下拉/tabs | pixel / flat / anime                            |
| 类型   | 下拉/tabs | character / monster / tile / item / ui / effect |
| 日期   | 快捷按钮  | 今天 / 本周 / 全部                              |
| 搜索   | 输入框    | 按 prompt 文本模糊搜索（前端过滤）              |

#### B. 批量操作

| 操作                 | 触发方式                    |
| :------------------- | :-------------------------- |
| 多选素材             | 长按 / 勾选 checkbox        |
| 批量删除             | 选中后顶部操作栏 "删除选中" |
| 批量生成 Spritesheet | 选中 → "生成精灵图集" 按钮  |
| 批量下载             | 选中 → "导出选中" ZIP       |

#### C. 项目/集合概念（P2 扩展）

```ts
// src/types/index.ts 追加
export const collectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  assetIds: z.array(z.string()),
  createdAt: z.string(),
});
```

- 新建集合：从素材列表中多选 → "保存为集合"
- 集合列表：侧边栏展示，点击加载集合内所有素材

---

## 6. Tileset 生成（P2）

### 6.1 功能概述

生成可用于地编（Tiled / Unity Tilemap / Godot TileMap）的无缝地砖素材。

### 6.2 Tileset 类型

| 类型              | 说明                                         | Prompt 特色                         |
| :---------------- | :------------------------------------------- | :---------------------------------- |
| **单一无缝 Tile** | 一张可重复平铺的纹理                         | `seamless tileable texture, {描述}` |
| **Auto-tile 组**  | 满足 Wang Tile / 自动拼接规则的 16/47 块地砖 | 按规则生成边缘/角落/中心变体        |
| **装饰Tile**      | 花草石头等可叠加在地砖上的装饰物             | 透明背景 + 单一物件                 |

### 6.3 Prompt 模板扩展 (`src/lib/prompt-templates.ts`)

```ts
const TILESET_TEMPLATES = {
  seamless: "{描述}，游戏地砖纹理，无缝平铺，俯视视角，{风格}",
  autotile: "{描述}，自动拼接地砖组，包含边缘和角落变体，{风格}",
  decoration: "{描述}，场景装饰物，俯视视角，透明背景，{风格}",
};
```

### 6.4 导出格式

- **Tiled `.tsx`**：Tiled Map Editor 的 tileset XML 格式
- **Godot `.tres`**：Godot TileSet 资源引用
- 均需配合 spritesheet 一块导出

### 6.5 实现优先级

P2 扩展，建议在 P0+P1 全部完成后再碰。

---

## 实施路线图

```
Phase A (Day 2 剩余 · 1-2h)
├── Seed / 负面提示词 UI       ← 改动最小，直接见效
└── 导出按钮 (下载PNG + 复制URL)  ← 简单修补

Phase B (Day 2 剩余 · 2-3h)
├── Spritesheet 核心库 + API    ← 核心价值
├── Spritesheet 前端 UI         ← 多选 + 预览 + 导出
└── JSZip 导出工程化            ← 与 spritesheet 共用依赖

Phase C (Day 3 · 3-4h)
├── 动画序列生成 API + UI       ← 差异化杀手功能
├── 素材管理筛选栏              ← 体验提升
└── 部署到 Vercel               ← 收尾

Phase D (赛后)
├── Tileset 生成
├── 项目/集合系统
└── UI 元素 / 特效扩展
```

---

## 关键决策记录

1. **JSZip 前端执行**：素材数量少（<64张），前端打包足够，不需要服务端 ZIP
2. **Spritesheet 格式首选 TexturePacker JSON Array**：Unity/Godot/Phaser 都兼容，覆盖面最广
3. **动画镜像优化**：2 方向模式左方向 = 右方向水平翻转，节省 50% API 调用
4. **assets-store 保持内存**：黑客松阶段不需要持久化到 DB，重启丢失可接受
