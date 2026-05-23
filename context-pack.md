# GisFy — Subagent Context Pack

> 用途：让 subagent（Explore / Plan / general-purpose 等）开工前快速获得完整上下文，避免主代理重复 brief
> 使用方式：派遣 subagent 时在 prompt 里写 "先读 context-pack.md 了解项目"
> 维护者：主代理在项目结构、依赖、约定发生**有意义变化**时同步更新

---

## TL;DR（30 秒读完）

GisFy 是一个 **3 天黑客松** AI 2D 游戏素材生成器，技术栈 **Next.js 16 + React 19 + Tailwind v4 + TypeScript 6 + Vercel AI SDK v6**。后端调阿里百炼通义万相生成 PNG，存七牛 Kodo + CDN。当前阶段：**仅初始化完毕，业务代码未开始**。

---

## 1. 必读文档优先级

1. **本文件** — 一页纸总览
2. [AGENTS.md](AGENTS.md) — 全部硬性约束（不要做什么 / 必须做什么）
3. [context.md](context.md) — 当前进度（有没有人已经在做这件事？）
4. [docs/GisFy_PRD.md](docs/GisFy_PRD.md) — 产品需求（功能优先级 P0/P1/P2）
5. [docs/GisFy_TDD.md](docs/GisFy_TDD.md) — 技术设计（API 契约、目录结构、Prompt 模板）
6. [docs/GisFy_API.md](docs/GisFy_API.md) / [docs/GisFy_Design.md](docs/GisFy_Design.md) — 细节

---

## 2. 技术栈与版本（关键！）

| 项 | 版本 | 注意 |
| :--- | :--- | :--- |
| Next.js | **16.2.6** | App Router + Turbopack 默认，**与训练数据有 breaking change** |
| React | **19.2** | Server Component 默认 |
| TypeScript | **6.0** | |
| TailwindCSS | **v4** | **CSS-first 配置**，无 `tailwind.config.ts` |
| Vercel AI SDK | **v6.0.189** | `ai` 包，新版 API |
| shadcn/ui | v4.7 | 用 `npx shadcn@latest add` |
| sharp | 0.34 | 图像处理 / Spritesheet 合成 |
| qiniu | 7.10 | 七牛 Node SDK |
| zod | 4.0 | API 校验 |

**写代码前若不确定 API**：`ls node_modules/next/dist/docs/` 查官方文档。

---

## 3. 仓库结构（当前 vs 目标）

### 当前实际
```
gisfy/
├── AGENTS.md / CLAUDE.md          # agent 指南（CLAUDE.md 只 @-引用 AGENTS.md）
├── context.md / context-pack.md   # 项目状态 / 本文件
├── docs/                          # PRD/TDD/API/Design 规格
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx               # 仅占位
│       └── globals.css
├── public/
├── package.json / tsconfig.json / next.config.ts / postcss.config.mjs / eslint.config.mjs
└── .env.local                     # 未提交，需用户配置
```

### 目标（按 TDD §2）
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── history/page.tsx
│   └── api/
│       ├── generate/route.ts
│       ├── upload/route.ts
│       └── assets/route.ts
├── components/   # Generator / StyleSelector / PromptEditor / Preview / SpritesheetEditor / AssetCard
├── lib/          # ali.ts / qiniu.ts / spritesheet.ts / prompt-templates.ts
└── types/index.ts
```

> ⚠️ TDD 中写 `app/...` 时，对应仓库 `src/app/...`。

---

## 4. 核心约束（subagent 必须遵守）

- ❌ 不要加新依赖（已锁定）；要加先回报主代理
- ❌ 不要写 `tailwind.config.ts`
- ❌ 不要在 components 里直接调外部 API（必须经 `src/app/api/*`）
- ❌ 不要把密钥写进代码 / 提交
- ❌ 不要修改 `docs/` 下的 PRD/TDD（规格不是笔记）
- ❌ 不要为"完整性"写 docstring / 防御性校验 / 未来扩展抽象
- ✅ Server Component 默认；客户端组件才加 `"use client"`
- ✅ API 响应统一 `{ success, data?, error? }`，请求/响应 zod 校验
- ✅ 三种风格固定：`pixel` / `flat` / `anime`
- ✅ Prompt 模板直接复用 TDD §4.2，不要自己设计

---

## 5. API 契约速查

| 路由 | 方法 | 用途 |
| :--- | :--- | :--- |
| `/api/generate` | POST | 调阿里百炼生成图片，返回 base64 |
| `/api/upload` | POST | 把 base64 上传到七牛 Kodo，返回 CDN URL |
| `/api/assets` | GET | 历史素材列表（分页） |
| `/api/assets` | DELETE | 删除素材 |

Request/Response 详细字段：[docs/GisFy_TDD.md §3](docs/GisFy_TDD.md)

---

## 6. 环境变量

```bash
# 阿里百炼
ALI_API_KEY=sk-xxx
ALI_MODEL=wanx2.1            # 默认；备选 wanx / wanx-lite

# 七牛
QINIU_ACCESS_KEY=xxx
QINIU_SECRET_KEY=xxx
QINIU_BUCKET=gisfy-assets
QINIU_DOMAIN=https://cdn.gisfy.com
```

放 `.env.local`（不提交）。subagent 看不到真实密钥时直接报告用户即可。

---

## 7. 常见任务的入手姿势

| 任务类型 | 起手位置 |
| :--- | :--- |
| 加 UI 组件 | `src/components/<Name>.tsx` + `"use client"`（如需 state） |
| 加 API | `src/app/api/<name>/route.ts` + zod schema |
| 加类型 | `src/types/index.ts` |
| 外部服务封装 | `src/lib/<service>.ts` |
| 调样式 | 直接在 JSX 里写 Tailwind class；全局变量改 `src/app/globals.css` 的 `@theme` |

---

## 8. 验证清单（完成报回主代理前自检）

- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过（重要改动）
- [ ] UI 改动：`npm run dev` 起服务，浏览器点过golden path
- [ ] 没有引入新依赖 / 没改 `docs/` / 没把密钥写进代码
- [ ] [context.md](context.md) 里"已完成 / 进行中"已更新

---

## 9. 不要做的"善意" overreach

- 看到代码"不整洁"不要顺手重构 —— 你的任务就是任务本身
- 看到 `TODO` 不要默认接管 —— 那是别人的工作
- 看到 PRD 里没写的"显然该有"的功能（登录、付费、监控）不要加 —— P2 也只在 P0+P1 完成后做
