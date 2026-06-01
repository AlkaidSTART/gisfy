# GisFy Quality Gates

## 1. Standard Gates

| Change type | Required verification |
| :--- | :--- |
| Documentation only | Confirm links, file paths, and current-state wording |
| API route change | `npm run lint`, relevant Vitest route tests, `npm run build` if types changed |
| Shared lib change | `npm run lint`, relevant unit/route tests, `npm run build` |
| UI change | `npm run lint`, `npm run build`, local browser golden path |
| Full release/demo | `npm run lint`, `npm run test`, `npm run build`, manual `/generate` demo |

## 2. Current Known Gates

The project has previously used:

```bash
npm run lint
npm run test
npm run build
```

Specific test files:

```text
tests/api-routes.test.ts
tests/auth-routes.test.ts
```

## 3. Demo Readiness Checklist

Before defense:

- [ ] Open `harness/defense-showcase.html` locally.
- [ ] Open `/generate` in the browser.
- [ ] Run one single-image generation path.
- [ ] Show status/progress in the preview card.
- [ ] Show existing asset history.
- [ ] Show animation sequence UI.
- [ ] Show spritesheet builder and JSON preview/export.
- [ ] Explain Qiniu target integration and Supabase/base64 fallback honestly.
- [ ] Prepare a fallback demo if external AI/storage services fail.

## 4. Risk Register

| Risk | Impact | Current mitigation | Defense wording |
| :--- | :--- | :--- | :--- |
| AI model output drift | Animation frames may vary | visual anchors, shared seed, phase prompts, negative prompts | "We reduce drift; we do not claim perfect identity locking." |
| External service config | Demo may fail if keys/buckets are missing | mock/base64/Supabase fallback | "Fallback keeps the workflow demonstrable." |
| Qiniu final switch | Current demo may not fully route through Kodo | Qiniu wrapper exists; upload route can be switched | "Qiniu is the target storage/CDN layer." |
| Stale docs | Early docs may lag implementation | `context.md` and source code are current truth | "We distinguish design intent from current implementation." |
| Serverless duration | Long sequence generation may timeout | async tasks, Redis queue/status, max duration on sequence route | "Long tasks are represented as tracked jobs." |

## 5. Judge-Facing Evidence

If asked for concrete engineering evidence, show:

| Claim | Evidence |
| :--- | :--- |
| Async generation | `src/app/api/generate/route.ts`, `src/app/api/generate/status/route.ts`, `src/lib/generation-queue.ts` |
| Real image generation path | `src/lib/ali.ts`, `src/lib/generation.ts` |
| Fallback design | `src/lib/supabase-storage.ts`, `src/lib/asset-repo.ts` |
| Spritesheet is real | `src/lib/spritesheet.ts` |
| Export package | `src/lib/export.ts` |
| Harness exists | `direction.md`, `AGENTS.md`, `context.md`, `context-pack.md`, `harness/*` |

