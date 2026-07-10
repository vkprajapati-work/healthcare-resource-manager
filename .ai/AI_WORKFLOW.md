# AI Workflow

> How Claude completes every task in this repository, from first read to Definition of Done.

## 1. Before coding — understand and search

Never write code against an imagined codebase. First:

- **Understand the existing implementation.** Read the code you will touch and the guideline doc for the area ([ARCHITECTURE](../docs/ARCHITECTURE.md) / [CODING_STANDARDS](../docs/CODING_STANDARDS.md) / [API_GUIDELINES](../docs/API_GUIDELINES.md) / [COMPONENT_GUIDELINES](../docs/COMPONENT_GUIDELINES.md)).
- **Search for reusable components** — `apps/frontend/src/components/ui/` and `components/common/` before building anything visual.
- **Search for existing hooks** — `apps/frontend/src/hooks/` (shared) and the feature's `hooks/` directory.
- **Search for utilities** — `apps/frontend/src/lib/`, `apps/backend/src/utils/`.
- **Search for shared types and schemas** — the feature/module's `schemas/` and `types/` directories (and `packages/shared` if it exists by then).

Only after this search may new code be written — and it must reuse what was found.

## 2. Before creating files

- **Verify a similar file doesn't already exist** (Glob/Grep by name and by content). Extending an existing file that owns the concern beats creating a near-duplicate.
- Confirm the target path is exactly where [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) prescribes; if no prescribed location fits, raise it rather than inventing structure.
- Use the scaffolding skills for module-shaped work: `/new-frontend-feature`, `/new-backend-module`, `/new-shared-package`.

## 3. Before adding dependencies

- **Explain why the dependency is needed**, what it replaces, and why the platform or an existing dependency can't do the job.
- Add the rationale to [docs/TECH_STACK.md](../docs/TECH_STACK.md) in the same PR.
- Check it doesn't contradict a documented "explicitly not used" decision (no Redux/Zustand, no CSS-in-JS, no Next.js).

## 4. Before refactoring

- **Explain the impact**: which files, call sites, and behaviors are affected, and what stays identical.
- **Preserve backward compatibility where appropriate** — keep public surfaces (feature `index.ts` exports, API envelope/paths) stable unless the task is explicitly a breaking change; breaking API changes follow the versioning strategy in [docs/API_GUIDELINES.md](../docs/API_GUIDELINES.md) §8.
- Refactors change structure, not behavior — if behavior must change, say so explicitly and split it into its own commit.

## 5. During implementation

- Schemas first (Zod), types derived (`z.infer`), then data layer, then UI/controllers.
- Loading, error, and empty states are part of the implementation, not a follow-up.
- Tests are written alongside the code, co-located with it.

## 6. After implementation — verify everything

Run the `/verify` skill, which executes the gates from the repo root:

| Check      | Command                                      |
| ---------- | -------------------------------------------- |
| TypeScript | `pnpm typecheck`                             |
| Linting    | `pnpm lint`                                  |
| Formatting | `pnpm format:check` (fix with `pnpm format`) |
| Tests      | `pnpm --filter <app> test`                   |

Then verify what static checks can't:

- **Accessibility** — labelled inputs, keyboard path works, async states announced, alt text present ([docs/CODING_STANDARDS.md](../docs/CODING_STANDARDS.md) §11).
- **Responsiveness** — layout holds at mobile, tablet, and desktop widths (mobile-first Tailwind breakpoints).
- **Behavior** — exercise the changed flow: hit the endpoint / load the view and confirm envelopes, status codes, and all three UI states.

## 7. Definition of Done

Walk [CHECKLIST.md](CHECKLIST.md) item by item. Report which checks ran and their actual results — a failed or skipped gate is stated, never glossed over.
