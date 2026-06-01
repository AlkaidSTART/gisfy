# GisFy Harness Document Map

## 1. Entry Files

| File | Audience | Purpose | Update rule |
| :--- | :--- | :--- | :--- |
| `direction.md` | Human, main agent, subagent | First routing layer | Update when read order or harness structure changes |
| `AGENTS.md` | Any coding agent | Hard constraints and workflow rules | Update when repo rules or required docs change |
| `context.md` | Human, main agent | Latest project truth | Update after meaningful milestones |
| `context-pack.md` | Subagents | Short context pack | Update when architecture or completion state changes |

## 2. Product And Technical Specs

| File | Purpose | Defense value |
| :--- | :--- | :--- |
| `docs/要求.md` | Original hackathon requirement | Shows alignment with the prompt |
| `docs/GisFy_PRD.md` | Product users, pain points, P0/P1/P2 | Shows scope control |
| `docs/GisFy_TSD.md` | Architecture, stack, API intentions | Shows technical planning |
| `docs/GisFy_API.md` | API request/response contract | Shows integration discipline |
| `docs/GisFy_Design.md` | Visual direction | Shows product polish |
| `docs/GisFy_Features.md` | Feature summary | Shows user-facing capability |

## 3. Defense Materials

| File | Use |
| :--- | :--- |
| `docs/GisFy_答辩文档.md` | Main defense script and talking points |
| `docs/GisFy_FAQ.md` | Judge-question preparation |
| `harness/defense-showcase.html` | Visual one-page exhibit |
| `harness/README.md` | Harness overview |
| `harness/agent-flow.md` | AI-assisted development workflow |
| `harness/quality-gates.md` | Verification and risk checklist |

## 4. Source Evidence

| Area | Files |
| :--- | :--- |
| Workspace UI | `src/app/generate/page.tsx`, `src/components/workspace/*` |
| Async generation | `src/app/api/generate/route.ts`, `src/app/api/generate/status/route.ts`, `src/lib/generation.ts`, `src/lib/generation-queue.ts` |
| Vision and prompt polish | `src/app/api/vision/route.ts`, `src/app/api/polish/route.ts` |
| Asset persistence | `src/app/api/assets/route.ts`, `src/lib/asset-repo.ts`, `src/lib/store/assets-store.ts` |
| Spritesheet | `src/app/api/spritesheet/route.ts`, `src/lib/spritesheet.ts`, `src/components/workspace/spritesheet-builder.tsx` |
| Export | `src/lib/export.ts` |
| Auth/session | `src/lib/auth.ts`, `src/lib/redis.ts`, `src/components/auth/login-modal.tsx` |

## 5. Drift Rules

When two files disagree:

1. Source code is the strongest evidence for actual behavior.
2. `context.md` is the strongest narrative evidence for current state.
3. `direction.md` is the strongest read-order evidence.
4. PRD/TSD/API describe design intent and may lag after rapid hackathon changes.

Do not present old design intent as current implementation without checking source code.

