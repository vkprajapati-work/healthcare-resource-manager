# Tech Stack

> Every technology in this repository, and why it was chosen. Do not add a dependency without a rationale that would belong in this file.

## Frontend

| Technology            | Role                    | Why                                                                                                                                                                                                               |
| --------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 18**          | UI library              | Industry standard for component-based SPAs; concurrent features; required by [requirement.md](../requirement.md); functional components only.                                                                     |
| **TypeScript**        | Language                | Compile-time safety across the whole stack; explicitly required ("TypeScript is a must"). Strict mode everywhere.                                                                                                 |
| **Vite**              | Build tool / dev server | Instant HMR, fast builds, first-class TS + React support; far lighter than CRA/webpack for an SPA of this size.                                                                                                   |
| **React Router v6**   | Client-side routing     | De-facto standard for SPA routing; declarative nested routes fit the app-shell + feature-page layout.                                                                                                             |
| **TanStack Query v5** | Server state management | Purpose-built for API data: caching, background refetch, pagination (`placeholderData`), and built-in `isLoading` / `isError` states that map 1:1 to FR-6/FR-7/FR-8. Removes the need for a global state library. |
| **Axios**             | HTTP client             | Interceptors for base URL/error normalization, automatic JSON handling, and typed request/response wrappers around the API envelope.                                                                              |
| **Tailwind CSS**      | Styling                 | Utility-first, colocated with markup, no naming overhead, tree-shaken output. Consistent design tokens via config.                                                                                                |
| **shadcn/ui**         | UI component primitives | Accessible (Radix-based), unstyled-by-default components copied into the repo — full ownership, no runtime dependency lock-in, styled with Tailwind.                                                              |
| **React Hook Form**   | Form state              | Performant (uncontrolled inputs, minimal re-renders) and pairs natively with Zod via `zodResolver` for the create/edit resource forms.                                                                            |
| **Zod**               | Schema validation       | Single source of truth for validation **and** TypeScript types (`z.infer`). Used for forms, API response parsing, and env validation.                                                                             |

## Backend

| Technology         | Role               | Why                                                                                                                                                                                                          |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Node.js (≥ 20)** | Runtime            | Required by [requirement.md](../requirement.md); one language (TypeScript) across the stack.                                                                                                                 |
| **Express.js**     | HTTP framework     | Minimal, unopinionated, huge ecosystem; the layered module architecture (routes → controller → service) supplies the structure Express doesn't impose.                                                       |
| **TypeScript**     | Language           | Same rationale as frontend; shared conventions in [CODING_STANDARDS.md](CODING_STANDARDS.md).                                                                                                                |
| **MongoDB**        | Database           | Document model fits the flexible `resource` entity (ambulance/doctor with optional image); native geo-indexes support future "nearby" queries; effortless pagination with `skip`/`limit` + `countDocuments`. |
| **Mongoose**       | ODM                | Schema enforcement on top of MongoDB, lifecycle hooks, query typing, and index management in code.                                                                                                           |
| **Zod** (backend)  | Request validation | Validates `body`/`query`/`params` at the boundary before controllers run; same library as frontend keeps mental model uniform.                                                                               |

## Testing

| Technology                | Role                     | Why                                                                                                                |
| ------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Jest**                  | Test runner (both apps)  | Explicitly required by [requirement.md](../requirement.md); mature, batteries-included.                            |
| **React Testing Library** | Frontend component tests | Tests behavior from the user's perspective (queries by role/label), which aligns with the accessibility standards. |
| **Supertest**             | Backend API tests        | Exercises the real Express app over HTTP without opening a port; ideal for envelope/status-code contract tests.    |

## Tooling

| Technology       | Role               | Why                                                                                                                                                           |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **pnpm**         | Package manager    | Fast, disk-efficient (content-addressed store), strict node_modules prevents phantom dependencies; first-class workspace support.                             |
| **Turborepo**    | Task orchestration | Runs `dev`/`build`/`lint`/`typecheck` across workspaces with dependency-aware ordering and caching; keeps CI fast.                                            |
| **ESLint**       | Linting            | Catches bugs and enforces the rules in [PROJECT_RULES.md](PROJECT_RULES.md) mechanically (e.g. `no-explicit-any`). Flat config, shared base extended per app. |
| **Prettier**     | Formatting         | Zero-debate, repo-wide consistent style; runs at the root (`pnpm format`).                                                                                    |
| **Husky**        | Git hooks          | Runs quality gates automatically at commit time so broken code never reaches CI.                                                                              |
| **lint-staged**  | Staged-file runner | Scopes Prettier/ESLint to staged files only, keeping pre-commit hooks fast.                                                                                   |
| **EditorConfig** | Editor baseline    | Consistent indentation/EOL across editors and OSes (notably LF on Windows).                                                                                   |

## Version Policy

- Node.js `>= 20`, pnpm `>= 9` (enforced via `engines` in the root `package.json`).
- Exact toolchain pinned via `packageManager` field (Corepack).
- Dependencies use caret ranges; the committed `pnpm-lock.yaml` is the source of reproducibility.

## Explicitly Not Used (and why)

- **Redux / Zustand** — TanStack Query covers server state; remaining UI state is local. Add a state library only with a demonstrated need.
- **Next.js** — no SSR/SEO requirement; a Vite SPA is simpler ("keep it simple" per the requirements).
- **CSS-in-JS (styled-components)** — the requirement lists it as a "plus", but Tailwind + shadcn/ui was chosen for lower runtime cost and faster composition; this is a deliberate, documented trade-off.
- **SQLite / in-memory JSON** — the requirement allows them for simplicity, but MongoDB + Mongoose was chosen as the production-ready path with room for geo queries.
