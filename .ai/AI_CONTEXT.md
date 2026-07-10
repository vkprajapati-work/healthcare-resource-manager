# AI Context

> Complete project context for AI-assisted development. Read together with [CLAUDE.md](../CLAUDE.md); the canonical, detailed versions live in [docs/](../docs/).

## Project purpose

Healthcare Resource Manager helps people find nearby ambulance services and doctors quickly in emergencies, and lets administrators manage those resources. It is a React SPA backed by an Express REST API and MongoDB, built in a pnpm + Turborepo monorepo.

## Business requirements

From [requirement.md](../requirement.md), formalized in [docs/PROJECT_CONTEXT.md](../docs/PROJECT_CONTEXT.md) §3:

- Full CRUD over ambulances and doctors (FR-1)
- Paginated list — first 10 by default, 10 per page (FR-2, FR-3)
- Total counts of ambulances and doctors visible in the app (FR-4)
- Each record shows title, description, location, and image when available (FR-5)
- Loading, error, and empty states are mandatory UI (FR-6, FR-7, FR-8)

Non-functional: strict type safety, validated boundaries, accessibility, paginated/cached data access, testability. Modern browsers only.

## Current state

**Backend:** built out and hardened. Modules: `resources` (the challenge's canonical `ambulance`/`doctor` list), `auth` (JWT cookie sessions, roles, provisioned logins), `doctors`, `drivers`, `vehicles` (a richer platform — license numbers, vehicle capacity/insurance, uploaded documents), `files` (upload/download/ownership-scoped storage), `health`, and `seed` (dev-only mock-data generator, blocked in production). `GET /resources` bridges in `doctors`/`vehicles` read-only so both surfaces show up in one list — see [docs/PROJECT_CONTEXT.md](../docs/PROJECT_CONTEXT.md) §8a for the full design and its one write-side restriction (`POST /resources` is temporarily disabled — use `POST /doctors` / `POST /vehicles`). 31 Jest tests, strict TypeScript, ESLint all green.

**Frontend:** not started — `apps/frontend` is still an empty placeholder (`.gitkeep` only).

## Planned features (frontend)

**MVP:** resource list (paginated, with counts and all three UI states) → create form → edit/update → delete with confirmation → resource card with image fallback, built against the `resources` API described above.

**Later:** filtering by type and text search, location-based "nearby" sorting (GeoJSON + 2dsphere index), deployment.

## Repository organization

```text
apps/frontend    React 18 + Vite SPA (feature-based architecture) — not started
apps/backend     Express + Mongoose API (layered domain modules) — built
docs/            Canonical engineering documentation
.ai/             AI guidance files (this directory)
.claude/skills/  Executable project skills for Claude Code
```

Shared code gets a `packages/shared` workspace only when the extraction trigger in [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) §9 is met.

## Architecture overview

- **Frontend:** feature modules under `src/features/<feature>/` (api, components, hooks, schemas, types, `index.ts` public surface). Server state in TanStack Query, form state in React Hook Form, page/filter state in the URL, no global state library.
- **Backend:** domain modules under `src/modules/<module>/` with strict layering — `routes → controller → service → repository → model`. Zod validation before controllers; central error middleware; standard success/error envelopes; all routes under `/api/v1`.
- **Dependency rules:** shared code never imports from features; features never reach into other features; backend layers point downward only.

Diagrams and full trees: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

## Development philosophy

- **Feature-oriented:** new work starts as a feature/domain module, not as scattered files.
- **Schemas first:** Zod schemas define data shapes; types derive from them (`z.infer`).
- **KISS + rule of three:** the simplest design that satisfies the docs; abstract on the third occurrence, never the first.
- **Reuse before build:** search for existing components/hooks/utilities before writing new ones.
- **Production-ready by default:** validated inputs, handled errors, all three UI states, accessible markup — in the first implementation, not a follow-up.
- **Docs are law:** if code must diverge from `docs/`, the doc is updated in the same PR.

## Long-term vision

The `type` discriminator (`'ambulance' | 'doctor'`) is designed to extend to new resource types (hospitals, pharmacies) without structural change. `location` can evolve from a string to GeoJSON for true proximity search. The API is versioned (`/api/v1`) so breaking changes ship as `/api/v2` with a deprecation window. The monorepo accommodates shared packages and additional apps (e.g. an admin panel) without restructuring.
