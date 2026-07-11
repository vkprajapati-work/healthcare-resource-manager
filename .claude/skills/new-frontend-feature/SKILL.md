---
name: new-frontend-feature
description: Scaffold a new feature module in apps/frontend following the project's feature-based architecture. Use when adding any user-facing feature (e.g. resources list, filtering, a new page/flow).
---

# New Frontend Feature

Scaffold and implement a feature module under `apps/frontend/src/features/<feature-name>/` exactly as defined in [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) §3 and [docs/COMPONENT_GUIDELINES.md](../../../docs/COMPONENT_GUIDELINES.md).

## Preconditions

- `apps/frontend` must be scaffolded (Vite + React 18 + TS). If it still contains only `.gitkeep`, stop and tell the user the app needs scaffolding first.
- Read [docs/PROJECT_RULES.md](../../../docs/PROJECT_RULES.md) if you haven't this session.

## Steps

1. **Create the module skeleton** (feature name in kebab-case):

   ```text
   apps/frontend/src/features/<feature-name>/
   ├── api/            # API functions + TanStack Query hooks + query key factory
   ├── components/     # Feature components (PascalCase.tsx)
   ├── hooks/          # Feature-specific hooks (use*.ts)
   ├── schemas/        # Zod schemas (camelCase + Schema suffix)
   ├── types/          # Types — derive from schemas with z.infer where possible
   └── index.ts        # Public API of the feature — re-exports ONLY
   ```

   Create only the folders the feature actually needs (KISS) — but never put files outside this structure.

2. **Schemas first.** Define Zod schemas for the feature's data and forms in `schemas/`; derive types via `z.infer`. Field rules must match the API contract in [docs/API_GUIDELINES.md](../../../docs/API_GUIDELINES.md) §5.

3. **API layer.** In `api/`: typed functions calling the shared axios client (`@/lib/api-client`), a query key factory (e.g. `resourceKeys.list(params)` — never inline key arrays), and hooks wrapping `useQuery`/`useMutation`. Paginated lists use `placeholderData: keepPreviousData`. Mutations invalidate the relevant list keys on success.

4. **Components.** Presentational by default — data comes in via props; fetching happens in hooks wired at the page level. One component per file, ~150 lines max, no business logic in JSX. Reuse `components/ui` and `components/common` before building anything visual.

5. **States.** Every data-driven view handles loading (skeletons, `role="status"`), error (`<ErrorState>` with retry), and empty (`<EmptyState>` with action) — see COMPONENT_GUIDELINES.md §9–§11. Pagination/filter state lives in the URL via React Router search params.

6. **Route.** Wire the page into `src/app/router.tsx`. Features never render global chrome.

7. **Public surface.** Export only what other parts of the app need through `index.ts`. Other features must never deep-import from this feature.

8. **Tests.** Co-locate Jest + React Testing Library tests with the components/hooks; query by role/label, not test IDs.

9. **Verify.** Run the `/verify` skill (lint, typecheck, format, tests) before declaring done.

## Hard rules

- No `any`, no `@ts-ignore`, strict TS.
- No cross-feature imports; shared code is promoted **down** to `components/common`, `hooks/`, or `lib/` — only when a second feature needs it.
- No new dependencies without updating [docs/TECH_STACK.md](../../../docs/TECH_STACK.md) in the same PR.
