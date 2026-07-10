# AI Rules

> **Mandatory rules Claude must always follow in this repository.** These restate and extend [docs/PROJECT_RULES.md](../docs/PROJECT_RULES.md) for AI-assisted development — if the two ever disagree, PROJECT_RULES.md wins and the discrepancy must be fixed in the same PR.

## Type safety

1. **Never use `any`** — not as a type, not as `as any`, not via `@ts-ignore`. Use `unknown` and narrow.
2. **Use strict TypeScript.** `strict: true` stays on in every workspace; never weaken compiler options to make code pass.
3. Derive types from Zod schemas (`z.infer`) instead of writing parallel definitions.

## Architecture

4. **Follow feature-based architecture.** New frontend work is a feature module; new backend work is a domain module. File placement follows [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) exactly — never invent parallel structure.
5. **Keep business logic separate from UI.** Components render; hooks and services decide.
6. Respect dependency direction: shared code never imports from features; features never deep-import other features; backend layers point downward only (`routes → controller → service → model`).
7. Prefer composition over inheritance and over configuration (children/slots over boolean-prop explosions).

## Code quality

8. **Prefer reusable components.** Check `components/ui` and `components/common` before building anything visual; promote a component to shared only when a second feature needs it.
9. **Avoid duplicated code.** Reuse existing utilities, hooks, and schemas before creating new ones — duplication is a review blocker.
10. **Do not create unnecessary abstractions.** Rule of three: abstract on the third occurrence, not the first.
11. **Prefer readability over cleverness.** Straightforward code that the next developer understands beats compact tricks. No code golf, no premature optimization.
12. **Use meaningful naming conventions** exactly as defined in [docs/CODING_STANDARDS.md](../docs/CODING_STANDARDS.md) §1 (kebab-case folders, PascalCase components, `use*` hooks, `*Schema` Zod schemas, `is/has` booleans).

## Production readiness

13. **Build production-ready code** in the first pass: validated inputs, handled errors, loading/error/empty states, no debug logging, no dead code, no unlinked TODOs.
14. **Maintain accessibility** ([docs/CODING_STANDARDS.md](../docs/CODING_STANDARDS.md) §11): semantic HTML, labelled inputs, keyboard operability, announced async states, meaningful alt text.
15. Every API response uses the standard envelopes and status codes from [docs/API_GUIDELINES.md](../docs/API_GUIDELINES.md) — no ad-hoc shapes.
16. Validate at every boundary with Zod: requests, forms, environment variables. Never read `process.env` outside the validated config module. Never commit secrets.

## Dependencies & scope

17. **Minimize dependencies.** Prefer the platform and what's already installed; a new dependency requires a rationale added to [docs/TECH_STACK.md](../docs/TECH_STACK.md) in the same PR.
18. Never scaffold features, packages, or dependencies that were not asked for.
19. When a requirement is ambiguous, choose the simplest solution consistent with the docs and **state the assumption** explicitly.

## Process

20. Tests accompany new behavior. `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and tests must pass before any task is declared done — verify with the `/verify` skill and the [CHECKLIST.md](CHECKLIST.md) Definition of Done.
21. Conventional Commits; one logical change per commit; never mix refactoring with feature changes.
22. Report results honestly: state exactly which checks ran and their outcomes; never present partially verified work as complete.
