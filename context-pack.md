# GisFy — Subagent Context Pack

> 用途：让 subagent 或新会话快速获得项目当前事实。  
> 维护规则：如果架构、完成度、harness 入口发生变化，必须同步本文件。  
> 首读入口：[direction.md](direction.md)

---

## TL;DR

GisFy 是七牛云黑客松项目：面向 2D 游戏开发者的 AI 游戏素材生成工具。当前不是初始化状态，核心闭环已经完成：文字生成素材、异步任务轮询、Prompt 润色、参考图视觉识别、素材历史、动画序列、Spritesheet 合成、PNG/JSON/ZIP 导出、首页与生成工作台均已上线。

答辩主线：GisFy 不是通用 AI 绘图 Demo，而是把 AI 生成结果接入 2D 游戏素材工作流。

---

## 1. 必读顺序

### 新会话 / 子代理

1. [direction.md](direction.md) — 入口导航，按任务选择文件
2. [AGENTS.md](AGENTS.md) — 硬性约束
3. [context.md](context.md) — 当前完成度
4. 本文件 — 压缩上下文

### 答辩准备

1. [docs/要求.md](docs/要求.md) — 赛题原文
2. [docs/GisFy_答辩文档.md](docs/GisFy_答辩文档.md) — 答辩脚本
3. [docs/GisFy_FAQ.md](docs/GisFy_FAQ.md) — 评委追问
4. [harness/README.md](harness/README.md) — harness 说明
5. [harness/defense-showcase.html](harness/defense-showcase.html) — 展示页

### 工程实现

1. [docs/GisFy_PRD.md](docs/GisFy_PRD.md) — 产品范围
2. [docs/GisFy_TSD.md](docs/GisFy_TSD.md) — 技术设计
3. [docs/GisFy_API.md](docs/GisFy_API.md) — API 契约
4. 相关 `src/` 文件

---

## 2. 技术栈

| 层级 | 技术 |
| :--- | :--- |
| 框架 | Next.js 16.2.6 App Router |
| UI | React 19.2 |
| 样式 | TailwindCSS v4 CSS-first |
| 类型/校验 | TypeScript + zod |
| AI 生成 | 阿里百炼通义万相 / DashScope 异步 API |
| 视觉理解 | Qwen VL 系列 |
| 存储 | 七牛 Kodo/CDN 目标集成；Supabase Storage/base64 fallback 用于演示韧性 |
| 状态/队列 | Redis 优先，本地 fallback |
| 图像处理 | sharp |
| 打包导出 | JSZip + file-saver |

关键约束：

- 不新增依赖，除非用户确认。
- 不写 `tailwind.config.ts`。
- 组件不直接调用外部 API，统一走 `src/app/api/*`。
- 不把密钥写进代码。
- 不随意修改 PRD/TSD/API/Design 规格文档。
- Next.js 16 不确定的 API 先读 `node_modules/next/dist/docs/`。

---

## 3. 当前能力

| 能力 | 状态 | 证据文件 |
| :--- | :--- | :--- |
| 文生图异步生成 | 已完成 | `src/app/api/generate/route.ts`, `src/lib/generation.ts` |
| 状态轮询 | 已完成 | `src/app/api/generate/status/route.ts`, `src/lib/store/task-store.ts` |
| Prompt 润色 | 已完成 | `src/app/api/polish/route.ts`, `src/components/workspace/prompt-editor.tsx` |
| 参考图视觉识别 | 已完成 | `src/app/api/vision/route.ts` |
| 生成工作台 | 已完成 | `src/app/generate/page.tsx`, `src/components/workspace/*` |
| 素材历史与筛选 | 已完成 | `src/app/api/assets/route.ts`, `src/lib/asset-repo.ts` |
| Seed / 负面提示词 | 已完成 | `src/components/workspace/param-controls.tsx`, `src/types/index.ts` |
| 动画序列 | 已完成 | `src/app/api/generate/sequence/route.ts`, `src/lib/animation-templates.ts` |
| Spritesheet | 已完成 | `src/app/api/spritesheet/route.ts`, `src/lib/spritesheet.ts` |
| ZIP 工程包导出 | 已完成 | `src/lib/export.ts` |
| 答辩材料 | 已完成 | `docs/GisFy_答辩文档.md`, `docs/GisFy_FAQ.md` |
| Harness 展示工程 | 已完成 | `direction.md`, `harness/*` |

---

## 4. 核心架构

```text
用户输入 Prompt/参数
  -> /api/generate 创建任务
  -> generation queue 执行模型调用
  -> task-store 保存 queued/processing/uploading/completed/failed
  -> generation 标准化 PNG + 上传/降级
  -> asset-repo 保存素材元数据
  -> 前端轮询 status 并展示结果
  -> 历史素材进入 spritesheet/export 流程
```

Spritesheet 路径：

```text
多选素材
  -> /api/spritesheet
  -> asset-repo 读取素材
  -> sharp 拼合透明 PNG
  -> exportSpritesheetJson 生成帧坐标
  -> 前端预览 / ZIP 导出
```

---

## 5. Harness 说明

本项目的 harness 是一套工程化约束，不是测试框架本身：

- `direction.md` 控制读文件路径，避免上下文过载。
- `AGENTS.md` 控制技术栈和禁止事项。
- `context.md` 记录当前事实。
- `context-pack.md` 给子代理快速同步。
- `harness/` 提供答辩可展示的流程、文档地图、质量门禁和 HTML 展示页。

答辩口径：

> Harness 的作用是让 AI 辅助开发可控、可追踪、可复盘：赛题要求、产品范围、技术设计、API 契约、Agent 规则、实现证据和验证结果被分层管理。

---

## 6. 常见任务入口

| 任务 | 先读 | 再读 |
| :--- | :--- | :--- |
| 答辩准备 | `direction.md` | `docs/GisFy_答辩文档.md`, `docs/GisFy_FAQ.md`, `harness/*` |
| 生成链路调试 | `direction.md` | `src/app/api/generate/*`, `src/lib/generation*`, `src/lib/store/task-store.ts` |
| Spritesheet 调试 | `direction.md` | `src/lib/spritesheet.ts`, `src/app/api/spritesheet/route.ts`, `src/components/workspace/spritesheet-builder.tsx` |
| 存储切换七牛 | `direction.md` | `src/lib/qiniu.ts`, `src/app/api/upload/route.ts`, `src/lib/supabase-storage.ts`, `src/lib/asset-repo.ts` |
| UI 修改 | `direction.md` | `src/app/generate/page.tsx`, `src/components/workspace/*`, `src/app/globals.css` |

---

## 7. 验证清单

根据改动范围选择：

- 文档改动：检查路径、链接、当前状态表述。
- API/lib 改动：`npm run lint`，相关 Vitest，必要时 `npm run build`。
- UI 改动：`npm run lint`，`npm run build`，本地浏览器点 golden path。
- 答辩前：打开 `harness/defense-showcase.html`，演示 `/generate`，准备 fallback 口径。

---

## 8. 当前待办

- Supabase Storage Bucket 手动创建或配置检查。
- 素材类型选择 UI 可继续强化。
- 七牛 Kodo/CDN 生产链路可进一步切换并作为答辩加分项。
- Vercel 部署当前不是开发主线，只保留可选。

