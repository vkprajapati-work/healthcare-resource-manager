# Component Guidelines

> How frontend components are structured, styled, and composed. Applies to everything under `apps/frontend/src`.

## 1. Component Structure

A component file, top to bottom:

```tsx
// 1. Imports (ordered per CODING_STANDARDS.md §14)
// 2. Constants
// 3. Props type
// 4. Component (single default concern, named export)
// 5. Private helpers/subcomponents (unexported)

interface ResourceCardProps {
  resource: Resource;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ResourceCard({ resource, onEdit, onDelete }: ResourceCardProps) {
  // hooks first, derived values second, handlers third, render last
  return <article>{/* JSX */}</article>;
}
```

- **Presentational by default**: components receive data via props. Data fetching happens in feature hooks, wired in at the page/container level.
- A component should fit on one screen (~150 lines). Larger → split.
- No business logic in JSX files — extract to hooks or pure functions.

## 2. Folder Structure

Feature components live inside their feature; shared components are promoted deliberately:

```text
src/
├── components/
│   ├── ui/          # shadcn/ui primitives — generated, then owned and edited here
│   └── common/      # App-wide composites: EmptyState, ErrorState, Spinner, Pagination, ConfirmDialog
└── features/
    └── resources/
        ├── components/   # ResourceList, ResourceCard, ResourceForm, ResourceStats
        ├── api/          # queries.ts, mutations.ts (TanStack Query hooks)
        ├── hooks/
        ├── schemas/
        └── index.ts      # public exports only
```

Promotion rule: a component moves from `features/x/components` to `components/common` only when a **second** feature needs it, and only if it is domain-agnostic.

## 3. Hooks

- All server-state access goes through feature hooks wrapping TanStack Query:

```ts
export function useResources(params: ResourceListParams) {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: () => resourcesApi.list(params),
    placeholderData: keepPreviousData,
  });
}
```

- Query keys are centralized per feature in a `resourceKeys` factory — never inline string arrays.
- Mutations invalidate the relevant list keys on success.
- Custom hooks own one concern; a hook returning more than ~5 values probably wants splitting.

## 4. Forms

- **React Hook Form + Zod** (`zodResolver`) for every form. The Zod schema is the single source of truth; input types are `z.infer`'d.
- One schema per form in `features/<feature>/schemas/`.
- Use shadcn/ui `Form` primitives so labels, descriptions, and error messages are wired for accessibility automatically.
- Submit buttons disable while submitting; server-side errors map back into the form (`setError`) or a form-level alert.
- Create and edit share one `ResourceForm` component parameterized by `defaultValues` and `onSubmit` — never duplicated.

## 5. State Management

| Kind of state       | Tool                         | Example                           |
| ------------------- | ---------------------------- | --------------------------------- |
| Server state        | TanStack Query               | resource lists, single resource   |
| Form state          | React Hook Form              | create/edit resource form         |
| Local UI state      | `useState` / `useReducer`    | dialog open, selected row         |
| URL state           | React Router (search params) | current page (`?page=2`), filters |
| Global client state | — none —                     | add only with a proven need       |

Pagination page and filters belong in the **URL**, so views are shareable and refresh-safe.

## 6. Reusability Rules

- Check `components/ui` and `components/common` before building anything visual.
- Never copy-paste a component to change one behavior — add a prop or compose.
- Do not fork shadcn/ui primitives per feature; customize via props/variants (`cva`) in `components/ui`.
- Rule of three applies (see [CODING_STANDARDS.md](CODING_STANDARDS.md) §9).

## 7. Styling Rules

- **Tailwind utilities only** — no inline `style`, no CSS modules, no CSS-in-JS.
- Class merging with the `cn()` helper (`clsx` + `tailwind-merge`); conditional classes go through `cn()`, never string concatenation.
- Variants for reusable components via `class-variance-authority` (the shadcn/ui pattern).
- Design tokens (colors, radii, spacing) live in the Tailwind config / CSS variables — no hard-coded hex values in components.
- Mobile-first responsive design (`sm:`, `md:`, `lg:` progressively).

## 8. UI Composition

- Prefer composition over configuration: pass `children`/slots rather than a dozen boolean props.
- Pages compose feature components; feature components compose primitives:
  `Page → ResourceList → ResourceCard → Card/Button (ui)`.
- Layout components (`app/layout`) own page chrome; features never render global chrome.

## 9. Loading States (FR-6)

- Every data-driven view renders a loading UI while `isPending` — skeletons (`components/ui/skeleton`) matching the final layout preferred over spinners for lists.
- Keep previous data visible during pagination transitions (`placeholderData: keepPreviousData`) with a subtle `isFetching` indicator.
- Loading regions announce themselves: `role="status"`, `aria-live="polite"`.

## 10. Error States (FR-7)

- Shared `<ErrorState>` component: icon, human-readable message, and a **Retry** button wired to `refetch`.
- Mutation failures surface as a toast plus, for forms, field-level errors where applicable.
- A route-level error boundary catches render errors so the app never white-screens.

## 11. Empty States (FR-8)

- Shared `<EmptyState>` component: icon, message ("No resources found"), and a primary action ("Add resource") when the user can resolve the emptiness.
- Distinguish **truly empty** (no data at all) from **filtered empty** (no matches — offer "clear filters").
- Empty state renders only after loading resolves successfully with zero items — never while `isPending`.
