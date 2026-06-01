# 🎮 GisFy — AI 2D 游戏素材生成器

> **将创意转化为游戏资产，只需一句话。**  
> 七牛云黑客松 · 3 天速通项目

[![Vercel](https://img.shields.io/badge/在线体验-gisfy.vercel.app-0EA5E9?style=for-the-badge&logo=vercel)](https://gisfy.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-源码-181717?style=for-the-badge&logo=github)](https://github.com/your-username/gisfy)
[![Bilibili](https://img.shields.io/badge/B站-演示视频-00A1D6?style=for-the-badge&logo=bilibili)](https://bilibili.com/video/XXXXX)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

---

## 📖 项目介绍

**GisFy** 是一个面向 2D 游戏开发者的 AI 驱动游戏素材生成工具。输入文字描述或上传参考图，即可秒级生成可直接导入 Unity、Godot、RPG Maker 等主流引擎的生产级游戏素材。

### 🔗 相关链接

| 链接                  | 地址                                                                                                                |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------ |
| 🌐 **在线体验**       | [gisfy.vercel.app](https://gisfy.alkaid.live/)                                                                      |
| 📂 **GitHub 仓库**    | [github.com/your-username/gisfy](https://github.com/your-username/gisfy)                                            |
| 🎬 **B站演示视频**    | [bilibili.com/video/XXXXX](https://www.bilibili.com/video/BV133Go6LE5u/?vd_source=5da587cf9716888499951dd0c8cc205d) |
| 📋 **产品需求文档**   | [docs/GisFy_PRD.md](docs/GisFy_PRD.md)                                                                              |
| 📐 **技术设计文档**   | [docs/GisFy_TSD.md](docs/GisFy_TSD.md)                                                                              |
| 📮 **API 接口文档**   | [docs/GisFy_API.md](docs/GisFy_API.md)                                                                              |
| 🎨 **设计风格文档**   | [docs/GisFy_Design.md](docs/GisFy_Design.md)                                                                        |
| 🏆 **黑客松答辩文档** | [docs/GisFy_答辩文档.md](docs/GisFy_答辩文档.md)                                                                    |
| ❓ **答辩 FAQ**       | [docs/GisFy_FAQ.md](docs/GisFy_FAQ.md)                                                                              |
| 🧭 **Harness 入口**   | [direction.md](direction.md) / [harness/README.md](harness/README.md)                                                |
| ✨ **功能介绍文档**   | [docs/GisFy_Features.md](docs/GisFy_Features.md)                                                                    |

---

## ✨ 功能概览

### 🎨 素材生成

- **文字描述 → AI 素材**：输入中文/英文描述，2-4 秒生成透明背景 PNG
- **三种风格**：像素风 (Pixel) · 扁平风 (Flat) · 日系动漫风 (Anime)
- **七种素材类型**：角色 · 怪物 · 场景 · 瓦片 · 道具 · UI 元素 · 特效
- **参数控制**：尺寸 (64/128/256/512) · 批量 (1/4/9) · Seed · 负面提示词

### 🖼️ 视觉动画序列

- 上传参考图 → `qwen-vl-max` 视觉识别 → 自动生成提示词
- 支持 6 种动作模板（Idle / Walk / Run / Attack / Hit / Die）
- 8 方向帧序列生成，网格预览

### 🧩 Spritesheet 合成

- 多素材一键合成精灵图
- 导出 ZIP 工程包（PNG + JSON 帧数据 + manifest）
- 兼容 Unity / Godot / TexturePacker

### 📋 素材管理

- 自动保存历史，多维筛选（风格/类型/日期/搜索）
- 批量选择 → 批量删除 / 一键导出
- 用户隔离（JWT 认证 + 注册/登录）

---

## 📸 截图

```
[待补充 — 建议插入工作台截图、生成演示动图]
```

---

## ⚡ 快速开始

### 前置条件

- Node.js ≥ 20
- 阿里百炼 API Key（[免费开通](https://bailian.console.aliyun.com)）
- Supabase 项目（[免费创建](https://supabase.com)）
- （可选）Upstash Redis（[免费 256MB](https://console.upstash.com)）

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/gisfy.git
cd gisfy

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env.local
# 编辑 .env.local 填入你的 API Key

# 初始化数据库
npx prisma db push

# 启动开发服务器（Turbopack，HMR < 50ms）
npm run dev

# 打开浏览器
open http://localhost:3000
```

### 环境变量

```env
# 阿里百炼（必填）
ALI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ALI_MODEL=wanx2.1-t2i-turbo
POLISH_MODEL=qwen3.6-plus
VISION_MODEL=qwen-vl-max

# Supabase（必填）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxx
SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxx

# Upstash Redis（用于会话管理，可选但推荐）
REDIS_URL=rediss://default:xxxxx@xxxx.upstash.io:6379

# JWT 签名密钥（可选但推荐）
JWT_SECRET=your-random-hex-string
```

---

## 🛠️ 技术栈

### 核心框架

| 依赖                   | 版本         | 说明                                       |
| :--------------------- | :----------- | :----------------------------------------- |
| `next`                 | **16.2.6**   | App Router + Turbopack 默认构建器          |
| `react`                | **19.2.4**   | Server Component 默认，内置 React Compiler |
| `typescript`           | **^5** / 6.0 | 全栈类型安全                               |
| `tailwindcss`          | **^4**       | CSS-first 配置，零 PostCSS 依赖            |
| `@tailwindcss/postcss` | **^4**       | TailwindCSS v4 PostCSS 插件                |

### AI 与图像

| 依赖             | 版本        | 说明                               |
| :--------------- | :---------- | :--------------------------------- |
| `ai`             | **6.0.189** | Vercel AI SDK，类型安全 AI 调用层  |
| `@ai-sdk/openai` | **3.0.65**  | OpenAI 兼容接口适配（DashScope）   |
| `sharp`          | **0.34.0**  | 高性能图像处理（Spritesheet 合成） |
| `jszip`          | **3.10.1**  | ZIP 工程包导出                     |
| `file-saver`     | **2.0.5**   | 浏览器端文件下载                   |

### 数据与存储

| 依赖                        | 版本        | 说明                             |
| :-------------------------- | :---------- | :------------------------------- |
| `@supabase/supabase-js`     | **2.106.1** | Supabase 客户端（DB + Storage）  |
| `@prisma/client` / `prisma` | **7.8.0**   | PostgreSQL ORM                   |
| `ioredis`                   | **5.10.1**  | Redis 客户端（Upstash 会话管理） |

### 认证与安全

| 依赖       | 版本      | 说明              |
| :--------- | :-------- | :---------------- |
| `jose`     | **6.2.3** | JWT 签名与验证    |
| `bcryptjs` | **3.0.3** | 密码哈希          |
| `zod`      | **4.4.3** | API 请求/响应校验 |

### UI 与动画

| 依赖                      | 版本               | 说明                   |
| :------------------------ | :----------------- | :--------------------- |
| `lucide-react`            | **1.16.0**         | 图标库                 |
| `gsap` / `@gsap/react`    | **3.15.0** / 2.1.2 | 高性能 Web 动画引擎    |
| `clsx` / `tailwind-merge` | **^2.1** / 3.6.0   | 条件 class 合并        |
| `shadcn/ui`               | **v4.7** (CLI)     | 基于 Radix UI 的组件库 |

### 开发工具

| 依赖                            | 版本              | 说明                |
| :------------------------------ | :---------------- | :------------------ |
| `eslint` / `eslint-config-next` | **^9** / 16.2.6   | 代码规范            |
| `vitest`                        | **4.1.7**         | 测试框架            |
| `@types/node` / `@types/react`  | **^20** / **^19** | TypeScript 类型定义 |

---

## 🏗️ 项目结构

```
gisfy/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 全局布局 + AuthProvider
│   │   ├── page.tsx                # 首页 Landing Page（GSAP 动画）
│   │   ├── globals.css             # TailwindCSS v4 + 主题变量
│   │   ├── generate/page.tsx       # 工作台（三栏布局）
│   │   ├── showcase/page.tsx       # 素材展示页
│   │   └── api/
│   │       ├── generate/route.ts   # AI 生成 + 异步任务
│   │       ├── generate/status/    # 任务状态轮询
│   │       ├── generate/sequence/  # 动画序列生成
│   │       ├── vision/route.ts     # 视觉识别（qwen-vl-max）
│   │       ├── polish/route.ts     # AI 润色（qwen3.6-plus）
│   │       ├── upload/route.ts     # 素材上传
│   │       ├── assets/route.ts     # 素材 CRUD
│   │       ├── spritesheet/route.ts# Spritesheet 合成
│   │       └── auth/*              # 注册/登录/登出
│   ├── components/
│   │   ├── workspace/              # 工作台组件
│   │   │   ├── animation-builder.tsx  # 动画序列生成器
│   │   │   ├── spritesheet-builder.tsx# Spritesheet 合成器
│   │   │   ├── preview-card.tsx       # 预览卡片（粒子动画）
│   │   │   ├── prompt-editor.tsx      # Prompt 编辑器 + AI润色
│   │   │   ├── style-selector.tsx     # 风格选择器
│   │   │   ├── param-controls.tsx     # 参数控制面板
│   │   │   ├── assets-toolbar.tsx     # 素材工具栏
│   │   │   └── history-bar.tsx        # 历史侧边栏
│   │   ├── layout/header.tsx      # 全局导航
│   │   ├── auth/login-modal.tsx    # 登录弹窗
│   │   └── ui/                    # shadcn/ui 基础组件
│   ├── lib/
│   │   ├── ali.ts                 # 阿里百炼 DashScope API
│   │   ├── qiniu.ts               # 七牛 Kodo SDK
│   │   ├── supabase-db.ts         # Supabase 数据库客户端
│   │   ├── supabase-storage.ts    # Supabase 存储客户端
│   │   ├── prisma.ts              # Prisma 客户端
│   │   ├── redis.ts               # Upstash Redis 客户端
│   │   ├── auth.ts                # JWT 认证工具
│   │   ├── generation.ts          # 生成流程编排
│   │   ├── prompt-templates.ts    # Prompt 模板
│   │   ├── spritesheet.ts         # Spritesheet 合成逻辑
│   │   ├── animation-templates.ts # 动画模板
│   │   ├── export.ts              # ZIP 导出
│   │   ├── response.ts            # 统一响应格式
│   │   ├── utils.ts               # 工具函数
│   │   └── store/                 # Zustand 状态管理
│   └── types/
│       └── index.ts               # 全局类型定义
├── docs/                          # 项目文档
├── prisma/
│   └── schema.prisma              # 数据库 Schema
├── tests/                         # API 测试
├── package.json
├── next.config.ts                 # Next.js 16 配置
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
└── vitest.config.ts
```

---

## 📊 性能指标

| 指标             | 数值               |
| :--------------- | :----------------- |
| 单图生成         | 2-4 秒             |
| 16 帧动画序列    | ~30 秒（异步并行） |
| Turbopack HMR    | < 50ms             |
| Spritesheet 合成 | < 1 秒             |
| 生产构建         | ~15 秒             |

---

## 📮 API 概览

| 端点                     | 方法       | 说明                    |
| :----------------------- | :--------- | :---------------------- |
| `/api/generate`          | POST       | AI 生成素材（异步任务） |
| `/api/generate/status`   | GET        | 查询任务状态            |
| `/api/generate/sequence` | POST       | 生成动画序列            |
| `/api/vision`            | POST       | 视觉识别参考图          |
| `/api/polish`            | POST       | AI 润色提示词           |
| `/api/upload`            | POST       | 上传素材到存储          |
| `/api/assets`            | GET/DELETE | 素材查询/删除           |
| `/api/spritesheet`       | POST       | 合成 Spritesheet        |
| `/api/auth/register`     | POST       | 用户注册                |
| `/api/auth/login`        | POST       | 用户登录                |
| `/api/auth/logout`       | POST       | 登出                    |

---

## 🧪 测试

```bash
# 运行 API 测试
npm test

# ESLint 检查
npm run lint

# 生产构建
npm run build

# 生产启动
npm start
```

---

## 🗺️ 路线图

### ✅ MVP 已完成（P0 + P1）

- [x] 文字 → 素材生成（3 种风格 × 7 种类型）
- [x] 视觉驱动动画序列（8 方向 × 6 种模板）
- [x] Spritesheet 合成 + ZIP 工程包导出
- [x] 素材历史管理 + 多维筛选
- [x] 参数控制（尺寸/数量/Seed/负面提示词）
- [x] AI 润色 + 视觉识别
- [x] 用户系统（JWT + bcrypt）
- [x] 批量操作（删除 + 导出）

### 🚀 未来规划

- [ ] Tilemap 瓦片地图生成（无缝拼接）
- [ ] UI 元素 + 特效素材生成
- [ ] OAuth 登录（GitHub / Google）
- [ ] Unity Package 直接拉取插件
- [ ] 风格一致性引擎（LoRA 微调）

---

## 📄 开源协议

本项目基于 MIT 协议开源。

---

## 🙏 致谢

- [阿里百炼 DashScope](https://bailian.console.aliyun.com) — 提供 AI 模型 API
- [Supabase](https://supabase.com) — 数据库 + 对象存储
- [Upstash](https://upstash.com) — Redis 会话管理
- [Vercel](https://vercel.com) — 部署平台
- [七牛云](https://www.qiniu.com) — 存储与 CDN
- [shadcn/ui](https://ui.shadcn.com) — 组件库
- [GSAP](https://gsap.com) — 动画引擎

---

_项目参与 [七牛云黑客松](https://www.qiniu.com) · 2026年5月_
