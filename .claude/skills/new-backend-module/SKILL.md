---
name: new-backend-module
description: Scaffold a new domain module in apps/backend following the layered routes → controller → service → model architecture. Use when adding a new API domain (e.g. resources, auth) or a new set of endpoints.
---

# New Backend Module

Scaffold and implement a domain module under `apps/backend/src/modules/<module-name>/` exactly as defined in [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) §4 and [docs/API_GUIDELINES.md](../../../docs/API_GUIDELINES.md).

## Preconditions

- `apps/backend` must be scaffolded (Express + TS + Mongoose). If it still contains only `.gitkeep`, stop and tell the user the app needs scaffolding first.
- Read [docs/PROJECT_RULES.md](../../../docs/PROJECT_RULES.md) if you haven't this session.

## Steps

1. **Create the module skeleton** (module name in kebab-case, plural noun):

   ```text
   apps/backend/src/modules/<module>/
   ├── <module>.routes.ts       # URL + verb + middleware chain → controller; no logic
   ├── <module>.controller.ts   # HTTP layer only: typed input → service → envelope + status
   ├── <module>.service.ts      # Business logic; throws ApiError; never touches req/res
   ├── <module>.model.ts        # Mongoose schema + model; explicit indexes; toJSON strips _id/__v → id
   ├── <module>.validation.ts   # Zod schemas for body / query / params
   └── <module>.types.ts        # DTOs and module types (z.infer where possible)
   ```

2. **Validation first.** Zod schemas in `<module>.validation.ts` for every route's `body`/`query`/`params`. `:id` params validate as ObjectId. Unknown body fields are stripped, not rejected. Pagination: `page ≥ 1` (default 1), `1 ≤ limit ≤ 100` (default 10), with coercion.

3. **Model.** Mongoose schema with `timestamps: true`, explicit indexes for every queried field, and a `toJSON` transform exposing `id` and removing `_id`/`__v`. Use `.lean()` for read-only queries.

4. **Service.** Pure business logic. Throw `ApiError(statusCode, code, message)` for domain failures (`NOT_FOUND` for missing ids — never return `null` up to the controller silently). No `req`/`res`, no status codes beyond the ApiError.

5. **Controller.** Receives validated, typed input; calls the service; responds with the standard success envelope (`{ success: true, data, meta? }`). Wrap every handler in `asyncHandler`. Status codes per API_GUIDELINES.md §6 (`201` create, `200` read/update/delete).

6. **Routes.** Plural-noun paths mounted under `/api/v1` in `app.ts`, `validateRequest` before the controller. `PATCH` for updates (not `PUT`).

7. **List endpoints** return `meta`: `{ page, limit, totalItems, totalPages }` (plus domain counts where the contract requires, e.g. `meta.counts` for resources). Out-of-range pages return `200` with empty `data` — not an error.

8. **Tests.** Jest + Supertest against the Express app: happy path per endpoint, validation failure (400 envelope), missing id (404 envelope). Co-locate in the module.

9. **Verify.** Run the `/verify` skill (lint, typecheck, format, tests) before declaring done.

## Hard rules

- Layer boundaries are absolute: routes hold no logic; controllers never touch the DB; services never touch HTTP.
- Every response — success or error — uses the standard envelope; no ad-hoc shapes.
- Config only from the validated env module; never `process.env` in module code; no hard-coded secrets/ports/connection strings.
- No new dependencies without updating [docs/TECH_STACK.md](../../../docs/TECH_STACK.md) in the same PR.
