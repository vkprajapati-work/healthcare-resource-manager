# Project Rules

> **Mandatory rules for every contribution to this repository — human or AI.**
> These are not suggestions. A change that violates a rule here must be fixed before merge.
> Detailed rationale and examples live in the other docs; this file is the checklist of record.

## TypeScript

1. **Never use `any`** — not as a type, not as `as any`, not via `@ts-ignore`. Use `unknown` and narrow, or fix the types.
2. **Strict TypeScript everywhere.** `strict: true` stays on; do not weaken compiler options to make code compile.
3. Derive types from Zod schemas (`z.infer`) instead of writing parallel type definitions.
4. Exported functions have explicit return types.

## Architecture

5. **Use feature-based architecture.** New frontend work starts as a feature module; new backend work starts as a domain module ([ARCHITECTURE.md](ARCHITECTURE.md)).
6. **Keep business logic out of UI components.** Components render; hooks and services decide.
7. **Respect the dependency rules**: shared code never imports from features; features never reach into other features' internals; backend layers point downward only (routes → controller → service → model).
8. **Follow SOLID principles where appropriate** — especially single responsibility (per component, per service, per hook).
9. Prefer **composition over inheritance** — in React (children/slots over prop explosions) and in TS (no class hierarchies for domain logic).

## Code Quality

10. **Avoid duplicated code.** Search for an existing utility/component/hook before writing a new one; reuse it or extend it.
11. **Do not create unnecessary abstractions.** Apply the rule of three: abstract on the third occurrence, not the first. KISS beats cleverness.
12. **Keep components small and focused** — one responsibility, roughly one screen of code.
13. **Ensure all code is production-ready**: validated inputs, handled errors, loading/error/empty states, accessible markup, no debug logging, no dead code, no TODOs without a linked issue.
14. **Maintain consistent naming and folder structure** exactly as defined in [CODING_STANDARDS.md](CODING_STANDARDS.md) — do not introduce parallel conventions.

## Boundaries & Contracts

15. Validate at every boundary with Zod: API requests, form inputs, environment variables.
16. All API responses use the standard envelopes and status codes in [API_GUIDELINES.md](API_GUIDELINES.md) — no ad-hoc response shapes.
17. Never read `process.env` outside the validated config module; never commit secrets or `.env` files.
18. Every data-driven view implements loading, error, and empty states ([COMPONENT_GUIDELINES.md](COMPONENT_GUIDELINES.md) §9–§11).

## Process

19. No new dependency without a rationale worthy of [TECH_STACK.md](TECH_STACK.md) — and add it there in the same PR.
20. Tests accompany new behavior; `pnpm lint`, `pnpm typecheck`, and tests must pass before a PR is opened.
21. Conventional Commits, one logical change per commit.
22. If a change contradicts these docs, **update the doc in the same PR** or don't make the change. Docs and code must never disagree silently.

---

### For Claude / AI assistants specifically

- Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) and the relevant guideline doc **before** generating code.
- Follow the file/folder placement rules exactly — do not invent new structure.
- When a requirement is ambiguous, prefer the simplest solution consistent with these docs, and state the assumption.
- Never scaffold features, packages, or dependencies that were not asked for.
