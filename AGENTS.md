<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GisFy — Agent 工作手册

> AI 2D 游戏素材生成工具 · 七牛云黑客松 3 天速通项目
> 详细需求见 [docs/GisFy_PRD.md](docs/GisFy_PRD.md)，技术设计见 [docs/GisFy_TDD.md](docs/GisFy_TDD.md)
> 当前进度见 [context.md](context.md)；子代理共享上下文见 [context-pack.md](context-pack.md)

---

## 1. 关键技术约束

本项目使用 **Next.js 16.2.6 + React 19.2 + TailwindCSS v4 + TypeScript 6 + Vercel AI SDK v6**。
这些版本相对训练数据有 breaking changes，**写代码前必读相关文档**：

- Next.js 路由 / API Routes / 配置 → 读 `node_modules/next/dist/docs/`
- TailwindCSS v4 → **CSS-first 配置**，不写 `tailwind.config.ts`，在 CSS 里 `@theme` / `@import`
- shadcn/ui v4 → 用 `npx shadcn@latest add`，支持 package imports
- AI SDK v6 → `generateImage` / `streamText` 接口与旧版差异较大
- React 19 → 默认 Server Component，需要客户端再加 `"use client"`

遵守所有 deprecation 警告。

---

## 2. 不要做的事

- ❌ 不要随便加依赖（已锁定在 [package.json](package.json)），需要新依赖先和用户确认
- ❌ 不要写 `tailwind.config.ts`（TailwindCSS v4 不需要）
- ❌ 不要把密钥写进代码或提交，统一用 `.env.local`
- ❌ 不要在 components 里直接调外部 API，必须走 `src/app/api/*` 路由
- ❌ 不要修改 [docs/](docs/) 下的 PRD/TDD/API/Design 文档（那是规格，不是工作笔记）
- ❌ 不要写没用的 docstring / 注释 / 抽象层 / 假想未来需求的代码

---

## 3. 目标范围（MVP）

按 [docs/GisFy_PRD.md §2.2](docs/GisFy_PRD.md) 的优先级：

- 🔴 **P0**：文字→素材生成、风格选择（pixel/flat/anime）、透明 PNG 导出、预览、七牛 Kodo 存储
- 🟡 **P1**：Spritesheet 合成、素材历史、下载、参数调节（尺寸/数量）、Seed、负面提示词
- 🟢 **P2**：Tilemap、UI 元素、特效、用户系统（**仅当 P0+P1 全部完成才碰**）

---

## 4. 目录结构（目标态）

按 [docs/GisFy_TDD.md §2](docs/GisFy_TDD.md) 实现，**映射到本仓库的 `src/` 目录**：

```
src/
├── app/
│   ├── layout.tsx              # 全局布局
│   ├── page.tsx                # 首页/生成页（RSC）
│   ├── history/page.tsx        # 素材历史
│   └── api/
│       ├── generate/route.ts   # AI 生成
│       ├── upload/route.ts     # 七牛上传
│       └── assets/route.ts     # 素材 CRUD
├── components/                 # 客户端组件
├── lib/                        # ali / qiniu / spritesheet / prompt-templates
└── types/index.ts
```

TDD 中写 `app/...` 时，对应到本仓库 `src/app/...`。

---

## 5. API 契约

完整定义见 [docs/GisFy_TDD.md §3](docs/GisFy_TDD.md) 与 [docs/GisFy_API.md](docs/GisFy_API.md)。

统一响应格式：
```ts
{ success: boolean, data?: T, error?: { code: string, message: string } }
```

请求/响应用 `zod` 校验，类型集中放 [src/types/index.ts](src/types/index.ts)。

---

## 6. 外部集成

| 服务 | 用途 | 环境变量 |
| :--- | :--- | :--- |
| 阿里百炼通义万相 | 文生图（默认 `wanx2.1`） | `ALI_API_KEY`, `ALI_MODEL` |
| 七牛 Kodo + CDN | PNG 存储（免费 10GB） | `QINIU_ACCESS_KEY`, `QINIU_SECRET_KEY`, `QINIU_BUCKET`, `QINIU_DOMAIN` |

封装位置：`src/lib/ali.ts`、`src/lib/qiniu.ts`。

---

## 7. 风格 & Prompt

三种固定风格：`pixel` / `flat` / `anime`。风格前缀和素材类型模板已经在 [docs/GisFy_TDD.md §4.2](docs/GisFy_TDD.md) 定义好，**直接复用，不要自己重新设计 prompt**。

---

## 8. 开发命令

```bash
npm run dev      # Turbopack（HMR < 50ms）
npm run build    # 生产构建
npm run start    # 生产启动
npm run lint     # ESLint 9
```

新增 npm scripts 前先确认。

---

## 9. 代码风格

- **改动最小化**：bug 修复不附带"顺手清理"，单次操作不写"未来扩展"的抽象
- **零容忍 dead code**：删就删干净，不留 `// 旧逻辑保留` 之类
- **默认不写注释**：除非记录非显然的"为什么"（隐性约束、workaround、反直觉行为）
- **不验证不可能的输入**：只在系统边界（用户输入、外部 API）做校验
- **UI 改动必须真跑起来**：起 `npm run dev` 在浏览器点一遍，不能只看类型检查就报完成

---

## 10. 工作流约定

1. 拿到任务先读 [context.md](context.md) 确认当前进度
2. 子代理开工前读 [context-pack.md](context-pack.md) 获取共享上下文
3. 完成阶段性任务后更新 [context.md](context.md) 的「已完成 / 进行中 / 下一步」
4. 黑客松节奏：Day 1 基建 → Day 2 生成闭环 → Day 3 Spritesheet + 部署。提前完成按 P1→P2 推；落后砍 P2
