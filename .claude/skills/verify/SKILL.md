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

> **Current state:** `apps/backend` is built out — gates 2–4 are meaningful there (ESLint flat config, strict `tsc`, and a Jest + Supertest suite covering auth/doctors/drivers/vehicles/resources/files/seed). `apps/frontend` is still an unscaffolded placeholder, so those gates run against zero packages for it until frontend work starts. For backend behavioral changes, also start the server and curl the affected route (e.g. `GET /api/v1/health`, `GET /api/v1/resources`) — see "Beyond the gates" below.

## Beyond the gates

Static checks are not verification. For behavioral changes, also **exercise the change**:

- Backend: hit the affected endpoint(s) and check the response envelope, status code, and error cases against [docs/API_GUIDELINES.md](../../../docs/API_GUIDELINES.md).
- Frontend: load the affected view and confirm the loading, error, and empty states actually render ([docs/COMPONENT_GUIDELINES.md](../../../docs/COMPONENT_GUIDELINES.md) §9–§11).

## Report honestly

State exactly which gates ran and their results. If a gate failed or was skipped, say so explicitly — never report partially verified work as done.
