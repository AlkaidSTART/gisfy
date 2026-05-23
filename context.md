# GisFy — 项目进度上下文

> 最后更新：2026-05-23
> 维护说明：每次完成阶段性任务后由 agent 更新此文件
> 关联文档：[AGENTS.md](AGENTS.md) · [docs/GisFy_PRD.md](docs/GisFy_PRD.md) · [docs/GisFy_TDD.md](docs/GisFy_TDD.md)

---

## 1. 一句话状态

**Day 1 早期阶段** — 项目脚手架已就绪（Next.js 16 + React 19 + Tailwind v4 + TS 6），依赖已安装，但 **业务代码尚未开始**。当前只有空壳首页。

---

## 2. 已完成 ✅

### 2.1 基础设施
- ✅ Next.js 16.2.6 项目初始化（App Router + Turbopack）
- ✅ TypeScript 6 + ESLint 9 配置（[tsconfig.json](tsconfig.json), [eslint.config.mjs](eslint.config.mjs)）
- ✅ TailwindCSS v4 接入（[postcss.config.mjs](postcss.config.mjs), [src/app/globals.css](src/app/globals.css)）
- ✅ 关键依赖已安装：`ai@6.0.189`, `sharp@0.34`, `qiniu@7.10`, `zod@4`

### 2.2 文档
- ✅ PRD / TDD / API / Design 规格文档（[docs/](docs/)）
- ✅ Agent 工作手册（[AGENTS.md](AGENTS.md)）
- ✅ 项目进度文档（本文件）
- ✅ 子代理共享上下文（[context-pack.md](context-pack.md)）

### 2.3 已有代码
- [src/app/layout.tsx](src/app/layout.tsx) — 全局根布局（极简）
- [src/app/page.tsx](src/app/page.tsx) — 首页占位（仅 `<h1>GisFy</h1>` + 一行 p）
- [src/app/globals.css](src/app/globals.css) — Tailwind v4 入口

---

## 3. 进行中 🚧

（无）

---

## 4. 待办 — 下一步计划 📋

按 PRD 优先级与 TDD 里程碑展开：

### Day 1 剩余任务

- [ ] **首页布局**：根据 [docs/GisFy_Design.md](docs/GisFy_Design.md) 实现 Header / Footer / 主区域
- [ ] **素材类型 + 风格选择 UI**：组件骨架
  - `src/components/StyleSelector.tsx`
  - `src/components/PromptEditor.tsx`
  - `src/components/Generator.tsx`
- [ ] **类型定义**：`src/types/index.ts`（`Asset`, `AssetType`, `Style`, API I/O）
- [ ] **阿里百炼封装**：`src/lib/ali.ts`（`generateImage(prompt, opts)`）
- [ ] **Prompt 模板库**：`src/lib/prompt-templates.ts`（复用 TDD §4.2）
- [ ] **`.env.local.example`**：环境变量模板（不含真实密钥）

### Day 2 计划

- [ ] **POST /api/generate**：`src/app/api/generate/route.ts`，调用阿里百炼，返回 base64
- [ ] **POST /api/upload**：`src/app/api/upload/route.ts`，七牛 Kodo 上传
- [ ] **七牛封装**：`src/lib/qiniu.ts`
- [ ] **预览组件**：`src/components/Preview.tsx`（大图 + 元信息 + 下载）
- [ ] **生成→上传→展示闭环**

### Day 3 计划

- [ ] **Spritesheet 合成**：`src/lib/spritesheet.ts` + UI（P1）
- [ ] **素材历史**：`src/app/history/page.tsx` + `/api/assets`（P1，localStorage 即可）
- [ ] **下载功能**：单图 PNG / Spritesheet ZIP（P1）
- [ ] **Seed + 负面词**：表单字段（P1）
- [ ] **Vercel 部署 + 演示脚本**

---

## 5. 风险与决策记录 ⚠️

| 日期 | 项 | 状态 | 备注 |
| :--- | :--- | :--- | :--- |
| 2026-05-23 | 模型默认选 `wanx2.1`（¥0.002/次）还是 `wanx`（¥0.001/次） | **未定** | TDD 推荐 wanx2.1，但黑客松成本敏感。建议演示用 wanx2.1，回归测试用 wanx |
| 2026-05-23 | 素材历史是否需要后端存储 | **倾向 localStorage** | MVP 用浏览器存储即可，避免做用户系统 |
| 2026-05-23 | 透明背景生成稳定性 | **待验证** | 通义万相对"透明背景"提示词响应需实测，可能需要后处理（sharp 抠图） |

---

## 6. 当前阻塞 🚨

（无 — 可立即开始 Day 1 剩余任务）

需要用户提供的信息：
- 七牛 `ACCESS_KEY` / `SECRET_KEY` / `BUCKET` / `DOMAIN`
- 阿里百炼 `API_KEY`

---

## 7. 完成度估算

| 维度 | 进度 |
| :--- | :--- |
| 基础设施 | █████████░ 90% |
| 文档 | █████████░ 95% |
| P0 功能 | ░░░░░░░░░░ 0% |
| P1 功能 | ░░░░░░░░░░ 0% |
| P2 功能 | ░░░░░░░░░░ 0% |
| **总体** | **~15%** |
