# GisFy — 项目进度上下文

> 最后更新：2026-05-23 · Day 2 中后期
> 关联文档：[AGENTS.md](AGENTS.md) · [docs/GisFy_PRD.md](docs/GisFy_PRD.md) · [docs/GisFy_TDD.md](docs/GisFy_TDD.md)

---

## 1. 一句话状态

生成闭环已完成（润色→生成→Supabase存储→预览），异步任务+动画已上线。`/:userid` 用户识别，参考图上传+视觉识别已就绪。

---

## 2. 已完成 ✅

- ✅ 阿里百炼封装（`src/lib/ali.ts`）
- ✅ Supabase Storage（替代七牛云）· `src/lib/supabase-storage.ts`
- ✅ `POST /api/generate` — 异步任务生成（fire-and-forget + 轮询）
- ✅ `GET /api/generate/status` — 任务状态轮询
- ✅ `POST /api/polish` — AI 润色（中文输出）
- ✅ `POST /api/vision` — 参考图上传 + qwen-vl-max 视觉识别
- ✅ `GET /api/auth/[userid]` — 用户识别（懒创建，替代 /me）
- ✅ `/generate` 页面：完整三栏布局 + GSAP 动画
- ✅ `PreviewCard`：异步生成粒子动画 + 环形进度 + 步骤指示 + 结果揭露
- ✅ `PromptEditor`：AI润色(中文,接受/拒绝) + 参考图上传 + Enter发送
- ✅ Assets store 按 userId 分片

---

## 3. 待办 📋

- [ ] Spritesheet 合成（P1）
- [ ] 素材类型选择 UI
- [ ] Seed 控制 + 负面提示词
- [ ] 首页 Landing Page
- [ ] Vercel 部署

---
