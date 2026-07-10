---
name: verify
description: Run this repo's quality gates after making changes - formatting, lint, typecheck, tests, and (once apps exist) exercising the affected app. Use before committing or declaring any task done.
---

# Verify Changes

Run every gate from the repo root. All must pass — fix failures, don't skip gates.

## Gates

1. **Formatting** — `pnpm format:check` (fix with `pnpm format`).
2. **Lint** — `pnpm lint` (runs per-app ESLint via Turborepo).
3. **Types** — `pnpm typecheck` (strict TS; never weaken compiler options to pass).
4. **Tests** — `pnpm --filter <app> test` for each app touched by the change.
5. **Build** — `pnpm build` when the change touches build config, dependencies, or shared code.

> **Current state:** `apps/frontend` and `apps/backend` are unscaffolded placeholders, so `lint`/`typecheck`/`test` run against zero packages. Once the apps exist, gates 2–4 become meaningful — update this skill then with app-specific run/smoke steps (e.g. start the backend and curl `/api/v1/health`; load the frontend and check the resource list renders).

## Beyond the gates

Static checks are not verification. For behavioral changes, also **exercise the change**:

- Backend: hit the affected endpoint(s) and check the response envelope, status code, and error cases against [docs/API_GUIDELINES.md](../../../docs/API_GUIDELINES.md).
- Frontend: load the affected view and confirm the loading, error, and empty states actually render ([docs/COMPONENT_GUIDELINES.md](../../../docs/COMPONENT_GUIDELINES.md) §9–§11).

## Report honestly

State exactly which gates ran and their results. If a gate failed or was skipped, say so explicitly — never report partially verified work as done.
