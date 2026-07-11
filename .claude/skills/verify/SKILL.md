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

> **Current state:** both apps are scaffolded and all gates are meaningful. `apps/backend`: ESLint flat config, strict `tsc`, Jest + Supertest suite covering auth/doctors/drivers/vehicles/resources/files/seed. `apps/frontend`: ESLint flat config, strict `tsc`, Jest + RTL (jsdom), plus `pnpm --filter frontend build` (tsc + Vite). For behavioral changes, also exercise the change: start the backend and curl the affected route (e.g. `GET /api/v1/health`, `GET /api/v1/resources`), or run `pnpm --filter frontend dev` and load the affected view — see "Beyond the gates" below.

## Beyond the gates

Static checks are not verification. For behavioral changes, also **exercise the change**:

- Backend: hit the affected endpoint(s) and check the response envelope, status code, and error cases against [docs/API_GUIDELINES.md](../../../docs/API_GUIDELINES.md).
- Frontend: load the affected view and confirm the loading, error, and empty states actually render ([docs/COMPONENT_GUIDELINES.md](../../../docs/COMPONENT_GUIDELINES.md) §9–§11).

## Report honestly

State exactly which gates ran and their results. If a gate failed or was skipped, say so explicitly — never report partially verified work as done.
