# GisFy Harness Direction

> Purpose: this is the first file to read when taking over the project or presenting the engineering workflow.

## 1. Current Answer

GisFy is a 2D game asset generation tool built for a Qiniu Cloud hackathon. The product is no longer a scaffold: the core path from prompt input to asynchronous AI generation, asset history, animation sequence generation, spritesheet packing, JSON metadata, and ZIP export is implemented.

For a defense or demo, the story is:

```text
赛题要求
  -> PRD/TSD/API define product and technical contracts
  -> AGENTS/context/direction define the agent harness
  -> Next.js API routes implement generation, upload, assets, vision, spritesheet
  -> workspace UI exposes prompt, parameters, preview, animation, history, export
  -> harness evidence shows how fast AI-assisted development stayed controlled
```

## 2. Read Order

For defense preparation:

1. `docs/要求.md` - original hackathon requirement.
2. `docs/GisFy_答辩文档.md` - how to present the product.
3. `docs/GisFy_FAQ.md` - likely judge questions.
4. `harness/README.md` - how the engineering harness works.
5. `harness/defense-showcase.html` - visual one-page exhibit.

For engineering work:

1. `AGENTS.md` - hard constraints and workflow rules.
2. `context.md` - latest project state.
3. `context-pack.md` - compact context for subagents.
4. `docs/GisFy_PRD.md` - product scope.
5. `docs/GisFy_TSD.md` - technical design.
6. `docs/GisFy_API.md` - API contract.
7. Relevant implementation files under `src/app/api`, `src/components/workspace`, and `src/lib`.

For live feature debugging:

1. `src/app/generate/page.tsx`
2. `src/app/api/generate/route.ts`
3. `src/app/api/generate/status/route.ts`
4. `src/lib/generation.ts`
5. `src/lib/generation-queue.ts`
6. `src/lib/store/task-store.ts`
7. `src/lib/asset-repo.ts`

## 3. Harness Map

| Layer | File | Role |
| :--- | :--- | :--- |
| Entry routing | `direction.md` | Tells humans and agents what to read first |
| Agent rules | `AGENTS.md` | Hard constraints, stack warnings, no-go rules |
| Shared state | `context.md` | Latest truth about completed and pending work |
| Subagent pack | `context-pack.md` | Compact kickoff context |
| Product contract | `docs/GisFy_PRD.md` | Users, scope, priorities |
| Technical contract | `docs/GisFy_TSD.md` | Architecture, stack, API intentions |
| API contract | `docs/GisFy_API.md` | Request/response shapes |
| Defense script | `docs/GisFy_答辩文档.md` | What to say in the defense |
| Defense FAQ | `docs/GisFy_FAQ.md` | How to answer judge questions |
| Harness exhibit | `harness/` | Visual and process evidence for the defense |

## 4. Guardrails

- Treat `context.md` as the current truth when older docs disagree.
- Do not edit PRD/TSD/API/design specs unless explicitly asked.
- Do not add dependencies without user confirmation.
- Keep external APIs behind `src/app/api/*`; frontend components do not call vendors directly.
- Keep demo honesty: Qiniu is the target object-storage/CDN layer; Supabase/base64 fallback exists to keep the hackathon demo resilient.
- After any meaningful work, update `context.md` and, if the workflow changed, update `context-pack.md`.

## 5. Defense Cue

Use this sentence if asked why the harness matters:

> GisFy was built under a three-day hackathon constraint, so the harness is the system that kept AI-assisted development controlled: original requirement, product scope, technical contracts, agent rules, current state, and verification evidence are separated instead of mixed into ad hoc prompts.

