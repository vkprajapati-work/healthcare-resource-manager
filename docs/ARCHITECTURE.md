# Architecture

> How the system is structured, how data flows through it, and the rules that keep it maintainable.

## 1. Overall System Architecture

A classic two-tier SPA + REST API architecture:

```text
┌──────────────────────┐        HTTPS (JSON)        ┌──────────────────────┐        ┌─────────────┐
│  Frontend (React)    │ ─────────────────────────▶ │  Backend (Express)   │ ─────▶ │   MongoDB   │
│  Vite SPA            │ ◀───────────────────────── │  REST API /api/v1    │ ◀───── │  (Mongoose) │
└──────────────────────┘                            └──────────────────────┘        └─────────────┘
```

- The frontend never talks to the database; all data access goes through the REST API.
- The API is stateless; all persistent state lives in MongoDB.

## 2. Monorepo Structure

```text
healthcare-resource-manager/
├── apps/
│   ├── frontend/    # deployable React SPA
│   └── backend/     # deployable Express API
├── docs/            # living documentation
├── turbo.json       # task graph: dev, build, lint, typecheck
└── pnpm-workspace.yaml
```

- Each app is an independent workspace with its own `package.json`, `tsconfig.json`, and ESLint config.
- Every app must implement the shared task names — `dev`, `build`, `lint`, `typecheck` — so Turborepo can orchestrate them.
- Shared code strategy: see §9.

## 3. Frontend — Feature-Based Architecture

```text
apps/frontend/src/
├── app/                    # Application shell
│   ├── router.tsx          # Route definitions (React Router v6)
│   ├── providers.tsx       # QueryClientProvider, etc.
│   └── layout/             # App-level layout (header, page container)
│
├── features/               # ★ Feature modules — the heart of the app
│   └── resources/
│       ├── api/            # API calls + query/mutation hooks (TanStack Query)
│       ├── components/     # Feature-specific components (ResourceList, ResourceCard, ResourceForm)
│       ├── hooks/          # Feature-specific hooks
│       ├── schemas/        # Zod schemas for forms and API payloads
│       ├── types/          # Feature types (derived from schemas where possible)
│       └── index.ts        # Public API of the feature (the only import surface)
│
├── components/
│   ├── ui/                 # shadcn/ui primitives (Button, Card, Dialog, …)
│   └── common/             # Shared app components (EmptyState, ErrorState, Spinner, Pagination)
│
├── hooks/                  # Shared generic hooks
├── lib/                    # axios instance, query client, cn() utility
├── config/                 # Env parsing, app constants
├── types/                  # Global shared types
└── main.tsx
```

### Component hierarchy (example: resource list page)

```text
<App>
└── <RootLayout>                       app/layout
    └── <ResourcesPage>                features/resources (route component)
        ├── <ResourceStats>            total counts (FR-4)
        ├── <ResourceList>             data orchestration via useResources()
        │   ├── <Spinner>              loading state (FR-6)
        │   ├── <ErrorState>           error state (FR-7)
        │   ├── <EmptyState>           empty state (FR-8)
        │   └── <ResourceCard>[]       title, description, location, image (FR-5)
        └── <Pagination>               10 per page (FR-3)
```

## 4. Backend — Layered Architecture

Each domain module is self-contained; layers within a module have strict responsibilities:

```text
apps/backend/src/
├── config/                     # env parsing (validated), db connection
├── modules/
│   └── resources/
│       ├── resources.routes.ts       # HTTP routes → controller mapping
│       ├── resources.controller.ts   # HTTP layer: req/res, status codes — no business logic
│       ├── resources.service.ts      # Business logic — no HTTP, no direct res/req
│       ├── resources.model.ts        # Mongoose schema + model
│       ├── resources.validation.ts   # Zod schemas for body/query/params
│       └── resources.types.ts        # DTOs and module types
├── middlewares/                # errorHandler, notFound, validateRequest
├── utils/                      # ApiError, response helpers, asyncHandler
├── app.ts                      # Express app assembly (middlewares, routes)
└── server.ts                   # Entry point: connect DB, start HTTP server
```

### Layer responsibilities

| Layer          | Owns                                                     | Must not                                   |
| -------------- | -------------------------------------------------------- | ------------------------------------------ |
| **Route**      | URL, HTTP verb, middleware chain                         | Contain logic                              |
| **Controller** | Parse validated input, call service, shape HTTP response | Touch the database, contain business rules |
| **Service**    | Business rules, orchestration                            | Know about `req`/`res`, status codes       |
| **Model**      | Schema, indexes, data-level constraints                  | Contain business workflows                 |

## 5. Data Flow

```text
User action (click / submit)
   │
   ▼
React component ──▶ TanStack Query hook (useQuery / useMutation)
   │                        │
   │                        ▼
   │                axios client (lib/api-client)
   │                        │  HTTP JSON
   ▼                        ▼
UI re-renders ◀── cache ◀── Express route
(loading / error /          │
 empty / data)              ▼
                     validateRequest (Zod) ──▶ controller ──▶ service ──▶ Mongoose model ──▶ MongoDB
                                                                 │
                     JSON envelope ◀── response helper ◀─────────┘
```

## 6. API Flow (request lifecycle)

1. Request hits Express → global middlewares (JSON parsing, CORS, logging).
2. Router matches `/api/v1/...` and runs `validateRequest` (Zod) on `body` / `query` / `params`.
3. Controller receives **typed, validated** input and calls the service.
4. Service executes business logic against the model, throws `ApiError` on domain failures.
5. Controller returns the success envelope; any thrown error falls through to the **central error middleware**, which maps it to the error envelope (see [API_GUIDELINES.md](API_GUIDELINES.md)).

## 7. Folder Conventions

- Folders: `kebab-case`. React component files: `PascalCase.tsx`. Everything else: `kebab-case.ts`.
- Backend module files are prefixed with the module name: `resources.service.ts`.
- Each frontend feature exposes its public surface via `index.ts`; deep imports into another feature are forbidden. Backend modules need no barrel: they are mounted via `<module>.routes.ts` in `app.ts`, and one module may depend on another only through its service.
- Tests live next to the code they test: `resource-card.test.tsx` beside `ResourceCard.tsx` (or in a `__tests__/` folder inside the module).

## 8. Dependency Rules

```text
app (shell)  ──▶  features  ──▶  shared (components/ui, lib, hooks, utils, config)

  ✅ features may import shared code
  ✅ app shell may import features (via their index.ts)
  ❌ shared code must NEVER import from features
  ❌ features must NEVER import from other features' internals
  ❌ backend layers only point downward: routes → controller → service → model
```

If two features need the same code, move it **down** into a shared folder — never sideways.

## 9. Shared Code Strategy

- **Now**: no shared package. Frontend and backend each own their Zod schemas. Acceptable duplication while the domain is one resource type.
- **Trigger to extract**: the same schema/type is edited in both apps more than once. Then create `packages/shared` (workspace `packages/*`), move schemas/DTOs there, and consume via `workspace:*`.
- Never share runtime server code (models, services) with the frontend — only types and validation schemas.

## 10. Non-Negotiables

- New functionality starts as a **feature module** (frontend) or **domain module** (backend).
- Cross-cutting concerns (error handling, validation, logging) live in shared middleware/utils — never re-implemented per module.
- Any deviation from this document requires updating this document in the same PR.
