# GisFy Agent Flow

## 1. Workflow Summary

```text
Requirement intake
  -> Scope split
  -> Technical contract
  -> Implementation phase
  -> Verification
  -> Context sync
  -> Defense evidence
```

This is the pattern used to keep AI-assisted development usable under hackathon pressure.

## 2. Phase Gates

| Gate | Input | Output | Stop condition |
| :--- | :--- | :--- | :--- |
| Intake | `docs/要求.md` | Challenge interpretation | Stop if the user goal is unclear |
| Scope | `docs/GisFy_PRD.md` | P0/P1/P2 priority | Stop if work drifts into P2 before P0/P1 |
| Design | `docs/GisFy_TSD.md`, `docs/GisFy_API.md` | Architecture and route contract | Stop if route/data contract is missing |
| Build | Relevant `src/*` files | Code or docs change | Stop if dependency or secret boundary is violated |
| Verify | lint/build/tests/manual demo | Evidence | Stop if an important gate fails |
| Sync | `context.md`, `context-pack.md` | Current truth | Stop if context would become stale |

## 3. Task Routing

| Task type | Start here | Then inspect |
| :--- | :--- | :--- |
| Generate flow bug | `direction.md` | `src/app/api/generate/*`, `src/lib/generation*`, `src/lib/store/task-store.ts` |
| Spritesheet bug | `direction.md` | `src/lib/spritesheet.ts`, `src/app/api/spritesheet/route.ts`, `src/components/workspace/spritesheet-builder.tsx` |
| UI polish | `direction.md` | `src/app/generate/page.tsx`, `src/components/workspace/*`, `src/app/globals.css` |
| Defense prep | `direction.md` | `docs/GisFy_答辩文档.md`, `docs/GisFy_FAQ.md`, `harness/defense-showcase.html` |
| Storage integration | `direction.md` | `src/lib/qiniu.ts`, `src/lib/supabase-storage.ts`, `src/app/api/upload/route.ts`, `src/lib/asset-repo.ts` |

## 4. Prompt Contract For Subagents

Use this when delegating:

```text
先读 direction.md 和 context.md。只读取与任务有关的文档和源码。
必须遵守 AGENTS.md：不新增依赖、不改规格文档、不在组件里直接调外部 API、不写 tailwind.config.ts。
完成后汇报：
1. 读了哪些文件
2. 改了哪些文件
3. 如何验证
4. 剩余风险
```

## 5. Defense Talking Point

> The harness made AI-assisted development auditable. Each task had a requirement source, a scoped product contract, a technical contract, implementation files, verification commands, and a context update.

