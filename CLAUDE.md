# Healthcare Resource Manager — Claude Code Project Memory

Full-stack app for managing healthcare resources (ambulances and doctors): React 18 SPA + Express REST API + MongoDB, organized as a pnpm + Turborepo monorepo.

**Current state:** `apps/frontend` is an empty placeholder (`.gitkeep` only). `apps/backend` has a working, tested Express + Mongoose API covering more than `resources`: it also has `auth`, `doctors`, `drivers`, `vehicles`, and `files` modules. `GET /resources` bridges in `doctors`/`vehicles` read-only (mapped into the resource shape, counted in `meta.counts`) — but writes still only touch the native `resources` collection, and `drivers` isn't bridged at all. See [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) §8a for the full design.

## Project overview & business goals

Users must be able to find nearby ambulance services and doctors quickly in emergencies. The app provides full CRUD over healthcare resources, a paginated list (10/page) with total counts, and always-communicative UI (loading / error / empty states — never a blank screen). Source requirements: [requirement.md](requirement.md); full breakdown: [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md).

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, React Router v6, TanStack Query v5, Axios, Tailwind CSS, shadcn/ui, React Hook Form, Zod
- **Backend:** Node.js (≥ 20), Express, TypeScript, MongoDB, Mongoose, Zod
- **Testing:** Jest + React Testing Library (frontend), Jest + Supertest (backend)
- **Tooling:** pnpm workspaces, Turborepo, Prettier — installed today. ESLint, Husky, and lint-staged are part of the target stack, to be added when the apps are scaffolded.

Rationale for every choice: [docs/TECH_STACK.md](docs/TECH_STACK.md).

## Repository structure

```text
apps/frontend    React SPA — feature-based: src/features/<feature>/{api,components,hooks,schemas,types,index.ts}
apps/backend     Express API — domain modules: src/modules/<module>/ layered routes → controller → service → model
docs/            Living documentation (canonical; keep in sync with code in the same PR)
.ai/             AI guidance: context, rules, workflow, prompts, Definition of Done
.claude/skills/  Project skills (see below)
```

Full trees and dependency rules: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Architecture essentials

- **Frontend — feature-based:** each feature owns its api/components/hooks/schemas/types and exports only through `index.ts`. Shared code (`components/ui`, `components/common`, `hooks/`, `lib/`) never imports from features; features never deep-import other features. New user-facing work starts as a feature module.
- **Backend — layered modules:** routes hold no logic; controllers never touch the DB; services never touch `req`/`res`/status codes; models own schema and indexes. Every response uses the standard success/error envelope from [docs/API_GUIDELINES.md](docs/API_GUIDELINES.md); all routes live under `/api/v1`.

## Standards (digests — canonical versions linked)

- **Coding** ([docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)): folders `kebab-case`, components `PascalCase.tsx`, other files `kebab-case.ts`, backend files `<module>.<layer>.ts`; Conventional Commits; import ordering external → `@/` alias → relative → types; tests co-located.
- **TypeScript:** `strict: true` always; **never `any`**, no `@ts-ignore`; derive types from Zod schemas (`z.infer`); union literals over enums; explicit return types on exported functions.
- **React:** functional components only; business logic in hooks, not JSX; props explicitly typed; components ≤ ~150 lines; composition over prop explosions; state as local as possible; pagination/filter state in the URL.
- **Express:** validate `body`/`query`/`params` with Zod before controllers run; `asyncHandler` on every route; throw an `AppError` subclass (`NotFoundError`, `ValidationError`, `AuthorizationError`, etc. — never a bare `AppError`, since its default code is generic) from services; config only via the validated env module — never `process.env` elsewhere.

## Performance expectations

Paginate every list endpoint (default 10, max 100). `placeholderData: keepPreviousData` for paginated queries. `.lean()` for read-only Mongoose queries; explicit indexes for every queried field. Memoize only for measured problems. Lazy-load images with fixed aspect ratios.

## Accessibility requirements

Semantic HTML first; every input labelled with errors announced via `aria-describedby`; keyboard-operable with visible focus; meaningful `alt` text; loading/error/empty states perceivable (`role="status"`, `aria-live="polite"`).

## Security considerations

- Validate and sanitize **all** input at the boundary (Zod); strip unknown body fields; validate `:id` as ObjectId before it reaches Mongoose.
- Never commit secrets or `.env` files; document variables in `.env.example`; env is read only through the validated config module.
- Never leak stack traces or internal error details in production responses — errors go through the central error middleware and the standard envelope.
- Configure CORS explicitly for known origins (no `*` in production); set standard security headers when the backend is scaffolded (record the chosen package in docs/TECH_STACK.md).
- No `dangerouslySetInnerHTML`; treat all rendered user content as untrusted.

## File organization & dependency management

- New files go exactly where [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) prescribes — never invent parallel structure. Before creating any file, check a similar one doesn't already exist.
- **No new dependency without justification** recorded in [docs/TECH_STACK.md](docs/TECH_STACK.md) in the same PR. Prefer the platform and existing dependencies. No global state library, no CSS-in-JS, no Next.js (documented decisions).

## Definition of Done

A task is done only when every item in [.ai/CHECKLIST.md](.ai/CHECKLIST.md) passes — typecheck, lint, formatting, tests, loading/error/empty states, validation, accessibility, no duplication, docs updated. Run the `/verify` skill; report results honestly.

## How Claude should work in this repo

Full workflow: [.ai/AI_WORKFLOW.md](.ai/AI_WORKFLOW.md). Mandatory rules: [.ai/AI_RULES.md](.ai/AI_RULES.md) and [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md).

- **Before any change — review first:** read the relevant guideline doc, then the existing code you're touching; search for existing components/hooks/utilities/types to reuse before writing anything new.
- **Feature implementation:** use `/new-frontend-feature` or `/new-backend-module`; schemas first, then data layer, then UI/controllers; states (loading/error/empty) are part of the feature, not a follow-up; tests accompany the code.
- **Refactoring:** state the impact and affected call sites before changing code; keep behavior identical (or say explicitly what changes); preserve public surfaces where practical; never mix refactors with feature changes in one commit.
- **When docs and code disagree:** update the doc in the same PR or don't make the change. When a requirement is ambiguous: choose the simplest solution consistent with the docs and state the assumption.

## Project skills

- `/new-frontend-feature` — scaffold a feature module in `apps/frontend`
- `/new-backend-module` — scaffold a domain module in `apps/backend`
- `/new-shared-package` — extract `packages/shared` (only when the trigger in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §9 is met)
- `/verify` — run the repo's quality gates after changes

## Commands (repo root)

| Command                             | Purpose                                           |
| ----------------------------------- | ------------------------------------------------- |
| `pnpm dev` / `pnpm build`           | Run / build all apps via Turborepo                |
| `pnpm lint` / `pnpm typecheck`      | Lint / type-check all apps                        |
| `pnpm format` / `pnpm format:check` | Format / verify formatting (Prettier, repo-wide)  |
| `pnpm --filter <app> <script>`      | Run a script for one app (`frontend` / `backend`) |
