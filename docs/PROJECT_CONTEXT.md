# Project Context

> The single source of truth for what this project is, what it must do, and how it is organized.
> Read this first before implementing anything.

## 1. Project Overview

**Healthcare Resource Manager** is a full-stack web application for managing and discovering healthcare resources — **ambulances** and **doctors** — so that users can quickly find nearby help in emergencies.

The application consists of:

- A **React SPA** (frontend) that lists, creates, edits, and deletes healthcare resources.
- A **Node.js/Express REST API** (backend) backed by **MongoDB** that persists and serves those resources.

Source requirements: [requirement.md](../requirement.md).

## 2. Business Requirements

- Accident cases are increasing; users need to find nearby ambulance services and doctors quickly, "with one click".
- The system must make healthcare resources easy to browse, search through pagination, and administer (full CRUD).
- The application must be reliable and communicative: users always see a loading, error, or empty state — never a blank screen.

## 3. Functional Requirements

| #    | Requirement                                                                     |
| ---- | ------------------------------------------------------------------------------- |
| FR-1 | Add, edit, update, and delete ambulances and doctors                            |
| FR-2 | View a list of ambulances and doctors                                           |
| FR-3 | Show the first 10 records by default, with pagination (10 records per page)     |
| FR-4 | Show the total count of ambulances and doctors in the app                       |
| FR-5 | Each record displays: title, description, location, and an image (if available) |
| FR-6 | Show a loading state until the list is available                                |
| FR-7 | Show an error state if the list is unavailable                                  |
| FR-8 | Show an empty state if there are no results                                     |

## 4. Non-Functional Requirements

- **Type safety**: Strict TypeScript everywhere; `any` is forbidden.
- **Performance**: Paginated API responses; cached server state via TanStack Query; fast dev/build via Vite and Turborepo caching.
- **Reliability**: Consistent API response/error envelopes; centralized error handling; input validation at every boundary.
- **Accessibility**: Semantic HTML, keyboard navigability, accessible forms and states (see [CODING_STANDARDS.md](CODING_STANDARDS.md)).
- **Maintainability**: Feature-based architecture, SOLID, DRY, KISS (see [ARCHITECTURE.md](ARCHITECTURE.md) and [PROJECT_RULES.md](PROJECT_RULES.md)).
- **Testability**: Unit and integration tests for both apps (Jest + React Testing Library on the frontend, Jest + Supertest on the backend).
- **Modern browsers only**: No legacy browser support required.

## 5. Repository Structure

```text
healthcare-resource-manager/
│
├── apps/
│   ├── frontend/        # React 18 + Vite + TypeScript SPA
│   └── backend/         # Node.js + Express + TypeScript REST API
│
├── docs/                # Project documentation (this directory)
├── package.json         # Root workspace manifest and scripts
├── pnpm-workspace.yaml  # pnpm workspace definition
├── turbo.json           # Turborepo task pipeline
├── .gitignore
├── .editorconfig
├── .prettierrc
├── README.md
└── LICENSE
```

A `packages/` directory for shared code (types, schemas) will be introduced **only when** the frontend and backend actually need to share code. Do not create it preemptively.

## 6. Frontend Architecture (summary)

- **Feature-based** organization: each feature (e.g. `resources`) owns its components, hooks, API calls, schemas, and types.
- **Server state** lives in TanStack Query; **form state** in React Hook Form; **UI state** in local component state. No global state library unless a proven need arises.
- **shadcn/ui + Tailwind CSS** for the design system; shared primitives live in `src/components/ui`.
- Full details: [ARCHITECTURE.md](ARCHITECTURE.md) and [COMPONENT_GUIDELINES.md](COMPONENT_GUIDELINES.md).

## 7. Backend Architecture (summary)

- **Layered, module-based** architecture: `routes → controller → service → model`.
- Each domain module (e.g. `resources`) is self-contained under `src/modules/<module>/`.
- Validation with **Zod** at the request boundary; persistence with **Mongoose**; centralized error middleware.
- Full details: [ARCHITECTURE.md](ARCHITECTURE.md) and [API_GUIDELINES.md](API_GUIDELINES.md).

## 8. Feature List

**MVP (must have)**

1. **Resource list** — paginated list of ambulances and doctors (10/page), with total count, loading/error/empty states.
2. **Resource create** — validated form (title, description, location, type, optional image URL).
3. **Resource edit/update** — same form, pre-populated.
4. **Resource delete** — with confirmation.
5. **Resource detail card** — title, description, location, image (with fallback when absent).

**Nice to have (later)**

- Filtering by resource type (ambulance / doctor) and text search.
- Location-based sorting ("nearby").
- Seed script for demo data.
- Deployment.

## 9. Future Scalability Considerations

- **Shared package**: extract shared Zod schemas/DTO types to `packages/shared` once duplication appears.
- **New resource types**: the data model uses a `type` discriminator (`ambulance` | `doctor`) so new types (e.g. `hospital`, `pharmacy`) can be added without structural change.
- **Auth**: architecture leaves room for an `auth` module (middleware slot already planned in the Express pipeline).
- **API versioning**: all routes are under `/api/v1` from day one (see [API_GUIDELINES.md](API_GUIDELINES.md)).
- **Geo queries**: `location` can evolve from a string to GeoJSON + MongoDB 2dsphere index for true "nearby" search.

## 10. Folder Organization

Detailed conventions live in [ARCHITECTURE.md](ARCHITECTURE.md). The non-negotiables:

- Group by **feature/module**, not by technical kind, at the top level of each app.
- Shared, generic code lives in clearly named shared folders (`components/ui`, `lib`, `utils`).
- A feature may import from shared folders; shared folders must **never** import from features.

## 11. Development Workflow

1. **Branch** from `main`: `feat/<name>`, `fix/<name>`, `chore/<name>`, `docs/<name>`.
2. **Develop** with `pnpm dev` (all apps) or `pnpm --filter <app> dev`.
3. **Verify** before committing: `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, tests.
4. **Commit** using Conventional Commits (see [CODING_STANDARDS.md](CODING_STANDARDS.md)).
5. **Open a PR** into `main`; the code review checklist in [CODING_STANDARDS.md](CODING_STANDARDS.md) applies.

## Related Documents

- [ARCHITECTURE.md](ARCHITECTURE.md) — system and folder architecture
- [TECH_STACK.md](TECH_STACK.md) — technology choices and rationale
- [CODING_STANDARDS.md](CODING_STANDARDS.md) — conventions and quality rules
- [API_GUIDELINES.md](API_GUIDELINES.md) — REST API contract
- [COMPONENT_GUIDELINES.md](COMPONENT_GUIDELINES.md) — frontend component rules
- [PROJECT_RULES.md](PROJECT_RULES.md) — mandatory rules for all contributions
