# GisFy — 设计风格文档 (Design System)

> 版本：v1.0
> 更新时间：2026-05-23
> 框架：TailwindCSS v4 + shadcn/ui v4
> 设计原则：极简、游戏感、高效

---

## 1. 设计语言

### 1.1 设计原则

| 原则 | 说明 |
| :--- | :--- |
| 🎮 **游戏感** | 整体风格向游戏工具靠拢，让用户感受到"这真是做游戏用的" |
| ✨ **极简** | 降低认知负担，核心功能一眼可见，不干扰创作流程 |
| ⚡ **高效** | 生成流程 ≤ 3 步操作，减少不必要的选项 |
| 🎯 **以素材为中心** | 预览区是页面的绝对主体，参数面板为辅 |

### 1.2 品牌色系

```
主色：🎮 青蓝 (#06B6D4 → cyan-500)  — 创造、科技感、游戏能量
辅色：💜 紫色 (#8B5CF6 → violet-500) — 创意、灵感、AI 魔法
背景：⬛ 深色 (#0A0A0A → neutral-950) — 模拟 IDE 暗色主题
```

### 1.3 配色方案

#### 深色模式（默认）

| 用途 | Tailwind | 说明 |
| :--- | :--- | :--- |
| 背景 | `neutral-950` | 类 IDE 深色 |
| 卡片 | `neutral-900` | 略微提亮 |
| 主文字 | `neutral-100` | 高对比白色 |
| 辅助文字 | `neutral-400` | 次要信息 |
| 主色 | `cyan-400` | 按钮/链接/激活态 |
| 辅色 | `violet-400` | 标签/徽章 |

#### 浅色模式

| 用途 | Tailwind | 说明 |
| :--- | :--- | :--- |
| 背景 | `neutral-50` | 柔和白底 |
| 卡片 | `white` | 内容容器 |
| 主文字 | `neutral-900` | 高可读性 |
| 辅助文字 | `neutral-500` | 次要信息 |
| 主色 | `cyan-500` | 按钮/链接/激活态 |
| 辅色 | `violet-500` | 标签/徽章 |

---

## 2. 排版

### 2.1 字体

| 用途 | 字体 | 回退 |
| :--- | :--- | :--- |
| 中文 | **Noto Sans SC** | system-ui, sans-serif |
| 英文 | **Inter** | system-ui, sans-serif |
| 等宽 | **JetBrains Mono** | monospace |

### 2.2 字号

| 层级 | 大小 | 粗细 | 用途 |
| :--- | :--- | :--- | :--- |
| h1 | 30px | Bold | 页面标题 |
| h2 | 24px | Semibold | 区块标题 |
| h3 | 20px | Semibold | 卡片标题 |
| body | 14px | Normal | 正文 |
| caption | 12px | Normal | 辅助说明 |

---

## 3. 页面布局

```
┌───────────────────────────────────────────────┐
│  🎮 GisFy            [素材历史] [ ? ]         │ Header
├───────────────────┬───────────────────────────┤
│                   │                           │
│  参数面板          │   素材预览区                │
│  ┌─────────────┐  │   ┌─────────────────┐    │
│  │ 类型 ▼       │  │   │                 │    │
│  │ 风格 [P][F][A]│  │   │    🖼️ 素材预览    │    │
│  │ 尺寸 [256]   │  │   │                 │    │
│  │ 数量 [1]     │  │   │  [2.3s ¥0.001] │    │
│  │              │  │   └─────────────────┘    │
│  │ [输入描述...] │  │                           │
│  │              │  │  [下载] [七牛] [重试]       │
│  │ [🚀 生成]    │  │                           │
│  └─────────────┘  │                           │
├───────────────────┴───────────────────────────┤
│  最近生成                                 → 全部 │
│  [卡] [卡] [卡] [卡] [卡]                       │
└───────────────────────────────────────────────┘
```

### 响应式

| 断点 | 宽度 | 布局 |
| :--- | :--- | :--- |
| sm | ≥640px | 参数在上，预览在下 |
| md | ≥768px | 参数在左，预览在右 |
| lg | ≥1024px | 全宽展示 |

---

## 4. 组件风格

### 按钮

| 类型 | 样式 | 用途 |
| :--- | :--- | :--- |
| 🟢 主要 | `bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg` | 生成 |
| 🟣 次要 | `bg-violet-500 hover:bg-violet-600 text-white` | 上传 |
| ⚪ 幽灵 | `bg-transparent border border-neutral-700 hover:bg-neutral-800` | 重试 |
| 🔴 危险 | `bg-red-500 hover:bg-red-600 text-white` | 删除 |

### 卡片

```
bg-neutral-900 rounded-xl shadow-lg border border-neutral-800
```

### 输入框

```
bg-neutral-900 border border-neutral-700 rounded-lg
focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
placeholder: text-neutral-500
```

### 风格标签

```
未选中: bg-neutral-800 text-neutral-300 border border-neutral-700
选中:   bg-cyan-500/20 text-cyan-400 border border-cyan-500
悬停:   bg-neutral-700
```

### 加载状态

```
骨架屏 + 进度条动画 + 实时百分比 + 底部随机小贴士
```

### Toast

| 类型 | 颜色 | 说明 |
| :--- | :--- | :--- |
| ✅ 成功 | green | 生成成功、上传成功 |
| ❌ 错误 | red | API 错误、参数错误 |
| ⚠️ 警告 | yellow | 限流、费用超预算 |
| ℹ️ 信息 | blue | 提示信息 |

---

## 5. 预览规范

- 图片居中显示，**实际像素**不拉伸
- 透明背景显示 **棋盘格**
- 支持点击全屏 Modal 查看
- 底部显示元数据：风格/尺寸/耗时/费用

### 历史卡片

```
┌──────────┐
│  🖼️      │  128x128 缩略图
├──────────┤
│ 像素风    │  风格标签
│ ¥0.001   │  费用
│ 2s前     │  时间
│ [↓]      │  快捷下载
└──────────┘
```

---

## 6. 动画

| 场景 | 动画 | 时间 |
| :--- | :--- | :--- |
| 页面加载 | fade-in | 0.3s |
| 生成中 | spin + 进度条 | — |
| 生成完成 | scale-in | 0.2s |
| 切换标签 | transition-colors | 0.2s |
| Toast | slide-down | 0.3s |
| Modal | backdrop-blur + scale-in | 0.3s |

---

## 7. 图标

| 场景 | 图标 | 来源 |
| :--- | :--- | :--- |
| 素材类型 | 🧑👾🏞️🧱🔪🖼️💥 | emoji |
| 操作按钮 | download/upload/trash | lucide-react |
| 导航 | history/settings/info | lucide-react |

尺寸：导航 20px / 按钮 16px / 标签 14px / 空状态 48px

---

## 8. 空状态

### 首次访问
```
🎮 欢迎使用 GisFy！
输入描述，AI 帮你生成游戏素材
试试： "一个红色药水，发光效果"
```

### 生成失败
```
😅 生成失败了
原因：网络不稳定 / 描述过于复杂
[🔄 重试]  [✏️ 修改描述]
```

### 无结果
```
🔍 没有找到匹配的素材，试试其他风格或关键词
```

---

## 9. shadcn/ui 组件清单

| 组件 | 用途 |
| :--- | :--- |
| Button | 所有操作按钮 |
| Input | prompt 输入框 |
| Select | 素材类型/尺寸选择 |
| Card | 预览卡片 / 历史卡片 |
| Badge | 风格标签 / 费用标签 |
| Dialog | 大图预览 Modal |
| Toast | 操作反馈通知 |
| Skeleton | 加载骨架屏 |
| Tabs | 风格切换标签 |
| Progress | 生成进度条 |

> 安装：`npx shadcn@latest add button card dialog toast ...`

---

## 10. TailwindCSS v4 配置

```css
/* app/globals.css */

@import "tailwindcss";

@theme {
  --color-brand: #06B6D4;
  --color-brand-dark: #0891B2;
  --color-accent: #8B5CF6;
  --font-sans: "Inter", "Noto Sans SC", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-scale-in: scale-in 0.2s ease-out;
  --animate-slide-down: slide-down 0.3s ease-out;

  @keyframes fade-in {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes scale-in {
    from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; }
  }
  @keyframes slide-down {
    from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; }
  }
}

@utility bg-checkerboard {
  background-image:
    linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
  background-size: 20px 20px;
}
```