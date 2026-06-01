# GisFy Harness Overview

> Defense purpose: show that GisFy was not built by uncontrolled prompt-and-patch work. It used a lightweight engineering harness to keep AI-assisted development aligned with the hackathon requirement.

## 1. What The Harness Is

The GisFy harness is a local engineering system made of documents, read-order rules, implementation boundaries, progress state, and verification gates.

It answers five questions:

| Question | Harness answer |
| :--- | :--- |
| What are we building? | `docs/要求.md`, `docs/GisFy_PRD.md` |
| How should it be built? | `docs/GisFy_TSD.md`, `docs/GisFy_API.md`, `AGENTS.md` |
| What is the current truth? | `context.md` |
| How do new agents avoid context overload? | `direction.md`, `context-pack.md` |
| How do we prove quality? | `harness/quality-gates.md`, test/build commands, implementation evidence |

## 2. Why It Exists

In a three-day AI hackathon, the risk is not only "can we build quickly". The risk is uncontrolled scope:

- A generic AI image demo instead of a game asset tool.
- Too much time spent on P2 features before the generation/export loop works.
- AI Agent edits that ignore Next.js 16, Tailwind v4, App Router, or API boundary rules.
- Stale context causing a new session to repeat old assumptions.
- Demo failure because cloud services or environment variables are incomplete.

The harness turns those risks into explicit rules:

- PRD defines P0/P1/P2.
- TSD/API define technical contracts.
- AGENTS defines no-go rules.
- context records the latest implementation state.
- fallback paths keep the demo runnable.
- quality gates provide evidence instead of vague confidence.

## 3. The Demonstrable Chain

```text
docs/要求.md
  -> docs/GisFy_PRD.md
  -> docs/GisFy_TSD.md
  -> docs/GisFy_API.md
  -> AGENTS.md
  -> direction.md
  -> context.md / context-pack.md
  -> src/app/api/*
  -> src/components/workspace/*
  -> harness/quality-gates.md
```

This chain is the defense point: the project moved from competition requirement to product scope, technical design, agent constraints, implementation, and verification evidence.

## 4. Main-Agent / Subagent Pattern

The harness assumes a main-agent workflow:

| Actor | Responsibility |
| :--- | :--- |
| Main agent | Reads requirement, controls scope, updates context, decides next phase |
| Explore subagent | Reads only relevant files and reports implementation facts |
| Build subagent | Implements a scoped phase under AGENTS rules |
| Review subagent | Checks defects, missing tests, contract drift, and demo risks |
| Human owner | Decides product direction, approves ambiguity, owns final defense wording |

Subagents should not load every file. They start from `direction.md`, then load only the relevant docs and source files.

## 5. What To Show In The Defense

Open these files in order:

1. `docs/要求.md` - the original challenge.
2. `direction.md` - how the project routes context.
3. `harness/defense-showcase.html` - visual architecture of the harness.
4. `context.md` - current completion evidence.
5. `src/app/api/generate/route.ts` and `src/lib/generation.ts` - real async generation implementation.
6. `src/lib/spritesheet.ts` - real spritesheet packing.
7. `docs/GisFy_答辩文档.md` and `docs/GisFy_FAQ.md` - prepared defense narrative.

## 6. Honest Boundaries

For Qiniu-specific questions:

- Qiniu Kodo/CDN is the target object-storage and CDN layer.
- `src/lib/qiniu.ts` keeps a Qiniu upload implementation.
- Current demo storage uses Supabase/base64 fallback where needed so the demo does not depend on one external configuration.
- The correct production next step is to route `/api/upload` and generation uploads fully through Qiniu Kodo, then store CDN URLs in the asset repository.

For feature scope questions:

- P0/P1 are the defense focus.
- Tilemap, advanced UI asset generation, and special effects are P2.
- The project intentionally prioritizes "usable game asset workflow" over broad but shallow feature count.

