# Reusable Prompts

> Copy-paste prompts for common development tasks in this repository. Replace `<placeholders>` before use. Each prompt assumes Claude has loaded [CLAUDE.md](../CLAUDE.md) and will follow [docs/PROJECT_RULES.md](../docs/PROJECT_RULES.md) and [AI_WORKFLOW.md](AI_WORKFLOW.md).

## Create a feature

```text
Use /new-frontend-feature to implement the "<feature-name>" feature in apps/frontend.

Requirements: <what the feature does, user-visible behavior>.
Data: <entities/fields involved and which API endpoints it consumes>.

Follow docs/COMPONENT_GUIDELINES.md. Schemas first, query-key factory in api/,
presentational components, loading/error/empty states, pagination/filter state in
the URL, co-located tests. Export only through index.ts. Run /verify when done.
```

## Create CRUD (full stack)

```text
Implement full CRUD for "<entity>" end to end.

Backend first: use /new-backend-module to create the <entities> module —
model (timestamps, indexes, toJSON id transform), Zod validation, service,
controller, routes under /api/v1/<entities> per docs/API_GUIDELINES.md
(envelopes, PATCH for update, pagination meta, 201/200/400/404).

Then frontend: use /new-frontend-feature for the <entities> feature — paginated
list (10/page) with total counts, create/edit via one shared form (React Hook
Form + Zod), delete with confirmation, loading/error/empty states.

Tests on both sides. Run /verify and report results.
```

## Create API endpoints

```text
Add the following endpoint(s) to the <module> module in apps/backend:

<METHOD> /api/v1/<path> — <purpose, inputs, outputs>

Follow docs/API_GUIDELINES.md exactly: Zod validation before the controller,
standard success/error envelopes, correct status codes, pagination meta for
lists. No logic in routes; no HTTP in services. Add Supertest coverage for the
happy path, validation failure (400), and missing id (404).
```

## Build a reusable component

```text
Build a reusable <ComponentName> component.

First check apps/frontend/src/components/ui and components/common for an
existing component or primitive to extend — report what you found. Place it in
components/common only if it is domain-agnostic and needed by more than one
feature; otherwise keep it inside the feature.

Requirements: <props, variants, behavior>. Tailwind + cn() only, variants via
cva, accessible by keyboard with proper roles/labels. Add RTL tests.
```

## Refactor existing code

```text
Refactor <file/module/feature> to <goal>.

Before changing anything: list the affected files and call sites and explain
the impact. Behavior must stay identical — no feature changes mixed in.
Preserve public surfaces (feature index.ts exports, API contract) unless I
explicitly approve a break. After: run /verify and confirm all existing tests
still pass unmodified (or explain any test change).
```

## Optimize performance

```text
Investigate and fix the performance issue in <area>: <symptom>.

Measure first — identify the actual cause before changing code, and show the
evidence. Prefer the documented levers: pagination bounds, .lean() reads,
missing indexes, keepPreviousData, image lazy-loading. Memoization only for
the measured hot path. No caching layers or new dependencies without approval.
Report before/after evidence.
```

## Review code

```text
Review <PR/diff/files> against this repo's standards.

Walk the code review checklist in docs/CODING_STANDARDS.md §15: architecture
and dependency rules, strict TS (no any), boundary validation, error handling,
loading/error/empty states, duplication, tests, accessibility, naming, docs
sync. Report findings ordered by severity with file:line references and a
concrete fix for each. Verify claims against the actual code — no speculation.
```

## Fix bugs

```text
Bug: <observed behavior>. Expected: <expected behavior>. Repro: <steps>.

First reproduce and diagnose the root cause — explain it before fixing.
Fix the cause, not the symptom. Add a regression test that fails without the
fix and passes with it. Check whether the same defect pattern exists elsewhere
in the codebase. Run /verify and report results.
```

## Add tests

```text
Add tests for <feature/module/file>.

Frontend: Jest + React Testing Library — test user-visible behavior (query by
role/label, not test IDs), covering data rendering plus loading, error, and
empty states. Backend: Jest + Supertest — envelope shape, status codes,
validation failures, missing-id 404s. Co-locate tests with the code. Do not
change production code to make tests pass without flagging it.
```
