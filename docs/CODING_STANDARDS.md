# Coding Standards

> Conventions every contribution must follow. Enforced by ESLint/Prettier where possible; by code review otherwise.

## 1. Naming Conventions

| Item                           | Convention                                       | Example                       |
| ------------------------------ | ------------------------------------------------ | ----------------------------- |
| Folders                        | `kebab-case`                                     | `features/resources/`         |
| React components (file + name) | `PascalCase`                                     | `ResourceCard.tsx`            |
| Non-component files            | `kebab-case.ts`                                  | `api-client.ts`               |
| Backend module files           | `<module>.<layer>.ts`                            | `resources.service.ts`        |
| Variables / functions          | `camelCase`                                      | `fetchResources`              |
| Types / interfaces / enums     | `PascalCase`, no `I`/`T` prefixes                | `Resource`, `PaginatedResult` |
| Constants (true constants)     | `SCREAMING_SNAKE_CASE`                           | `DEFAULT_PAGE_SIZE`           |
| Custom hooks                   | `use` prefix                                     | `useResources`                |
| Zod schemas                    | `camelCase` + `Schema` suffix                    | `createResourceSchema`        |
| Booleans                       | `is/has/should/can` prefix                       | `isLoading`, `hasImage`       |
| Event handlers                 | `handle` prefix (definition), `on` prefix (prop) | `handleSubmit`, `onDelete`    |

## 2. Folder Conventions

See [ARCHITECTURE.md](ARCHITECTURE.md) §3–§8. In short: feature/module-first organization, shared code lives below features, deep imports across features are forbidden.

## 3. TypeScript Rules

- `strict: true` in every `tsconfig.json`; additionally `noUncheckedIndexedAccess` and `noFallthroughCasesInSwitch`.
- **Never `any`** — use `unknown` + narrowing, or fix the type. No `as any`, no `@ts-ignore` (use `@ts-expect-error` with a comment only when unavoidable).
- Derive types from Zod schemas where a schema exists: `type CreateResourceInput = z.infer<typeof createResourceSchema>`.
- `interface` for object shapes that may be extended; `type` for unions, intersections, and function types.
- Prefer union literals over enums: `type ResourceType = 'ambulance' | 'doctor'`.
- Exported functions declare explicit return types.
- No non-null assertions (`!`) except in tests with a justifying comment.

## 4. React Best Practices

- Functional components only; hooks for all logic.
- Keep components **small and focused** — one responsibility; extract when a component handles data fetching _and_ complex rendering.
- Business/data logic lives in hooks (`useResources`), not in JSX components.
- Props are typed with an explicit `interface`/`type` per component; destructure in the signature.
- No prop drilling beyond ~2 levels — restructure with composition (`children`) first; context only for genuinely global concerns.
- Lists need stable `key`s (never array index for mutable lists).
- Co-locate state as close to usage as possible; lift only when shared.

## 5. Backend Best Practices

- Respect layer boundaries strictly (see [ARCHITECTURE.md](ARCHITECTURE.md) §4): controllers have no business logic; services never touch `req`/`res`.
- All async route handlers are wrapped (`asyncHandler`) so rejections reach the error middleware — no `try/catch` boilerplate in controllers.
- Configuration comes only from validated env (`config/env.ts` with a Zod schema); **never** read `process.env` elsewhere.
- Mongoose models define indexes explicitly; queries always use `.lean()` for read-only paths.
- No secrets, connection strings, or ports hard-coded.

## 6. Error Handling

- **Backend**: throw `ApiError(statusCode, code, message)` from services; the central error middleware converts anything thrown into the error envelope ([API_GUIDELINES.md](API_GUIDELINES.md) §3). Unknown errors become `500 INTERNAL_ERROR` without leaking internals.
- **Frontend**: TanStack Query surfaces errors via `isError`/`error`; every data-driven view renders an `<ErrorState>` with a retry action (FR-7). Mutations show a toast/inline message on failure.
- Never swallow errors (`catch {}`); never `console.log` an error as "handling".

## 7. Validation

- Validate at **every boundary**: API requests (backend Zod middleware), form inputs (React Hook Form + `zodResolver`), environment variables (both apps, at startup).
- The same conceptual rules must match on both sides (e.g. `title: min 1, max 200` in the form _and_ the API).
- Fail fast: invalid env kills the process at boot with a clear message.

## 8. Logging

- **Backend**: structured request logging middleware in dev; errors logged once, at the error middleware, with method, path, status, and stack (stack only outside production responses).
- **Frontend**: no stray `console.log` in committed code; `console.error` allowed only in top-level error boundaries/interceptors.

## 9. Reusability

- Before writing a utility, hook, or component: **search for an existing one**. Duplicating an existing helper is a review blocker.
- Rule of three: abstract on the third occurrence, not the first. Premature abstraction is treated as a defect, same as duplication.

## 10. Performance Guidelines

- Paginate every list endpoint (default 10, max 100 — see [API_GUIDELINES.md](API_GUIDELINES.md)).
- Use TanStack Query defaults (staleTime tuned per query); `placeholderData: keepPreviousData` for paginated lists so pages don't flash.
- `React.memo`/`useMemo`/`useCallback` only for **measured** problems — not by default.
- Images: lazy-load (`loading="lazy"`), fixed aspect ratio to avoid layout shift, fallback for missing images.
- Backend: `.lean()` reads, projections over full documents, indexes for every queried field.

## 11. Accessibility Requirements

- Semantic HTML first (`button`, `nav`, `main`, `ul`); ARIA only when semantics fall short.
- All form inputs have associated labels; validation errors are announced (linked via `aria-describedby`).
- Interactive elements are keyboard-operable and have visible focus states (never remove focus outlines without replacement).
- Images require meaningful `alt` text (or `alt=""` when decorative).
- Loading/empty/error states are perceivable by screen readers (e.g. `role="status"` / `aria-live="polite"`).

## 12. Git Commit Conventions

[Conventional Commits](https://www.conventionalcommits.org/): `type(scope): subject`

- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`.
- Scope = app or feature: `feat(frontend): add resource list pagination`, `fix(backend): return 404 for unknown resource id`.
- Subject in imperative mood, ≤ 72 chars, no trailing period.
- One logical change per commit.

Branch names: `feat/…`, `fix/…`, `chore/…`, `docs/…` (kebab-case).

## 13. File Organization

- One React component per file (small private subcomponents in the same file are fine if unexported).
- Order within a file: imports → constants → types → main export → helpers.
- Tests co-located with the code under test.
- `index.ts` files are for re-exports only — no logic in barrels.

## 14. Import Ordering

Grouped, with a blank line between groups (enforced by ESLint):

```ts
// 1. Node/external packages
import { useQuery } from '@tanstack/react-query';

// 2. Absolute internal aliases (@/…)
import { apiClient } from '@/lib/api-client';

// 3. Relative imports
import { ResourceCard } from './ResourceCard';

// 4. Types (type-only imports)
import type { Resource } from '../types';
```

- Use the `@/` alias for cross-folder imports; relative paths only within the same feature.
- Always `import type` for type-only imports.

## 15. Code Review Checklist

Before approving a PR, verify:

- [ ] Follows feature/module architecture and dependency rules
- [ ] No `any`, no `@ts-ignore`, strict TS passes (`pnpm typecheck`)
- [ ] Validation present at every new boundary (API, form, env)
- [ ] Errors handled via the standard mechanisms (no swallowed errors)
- [ ] Loading / error / empty states covered for new data-driven UI
- [ ] No duplicated logic — existing utilities reused
- [ ] Tests added/updated for new behavior; all tests pass
- [ ] Accessible: labels, keyboard, alt text, announced states
- [ ] No secrets or env values committed; `.env.example` updated
- [ ] Naming and file placement match this document
- [ ] `pnpm lint` and `pnpm format:check` pass
- [ ] Docs updated if architecture or API contract changed
