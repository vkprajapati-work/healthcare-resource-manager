# Definition of Done — Checklist

> Claude must verify every applicable item before declaring any task complete. Run the `/verify` skill for the automated gates; check the rest by inspecting the actual change. Items that don't apply to the change (e.g. UI items for a backend-only task) are marked N/A — never silently skipped.

## Automated gates

- [ ] **TypeScript passes** — `pnpm typecheck`, strict mode, no `any` / `@ts-ignore` introduced
- [ ] **Lint passes** — `pnpm lint` with zero errors
- [ ] **Formatting passes** — `pnpm format:check`
- [ ] **Tests pass** — all tests green; existing tests not weakened or deleted to force a pass; new or changed behavior covered by added/updated tests

## Code quality

- [ ] **No duplicated code** — existing components/hooks/utilities/schemas reused; nothing re-implemented
- [ ] Files placed exactly per [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md); naming per [docs/CODING_STANDARDS.md](../docs/CODING_STANDARDS.md)
- [ ] No debug logging, dead code, commented-out blocks, or TODOs without a linked issue

## UI (frontend changes)

- [ ] **Responsive** — layout holds at mobile, tablet, and desktop widths (mobile-first Tailwind)
- [ ] **Accessible** — semantic HTML, labelled inputs with announced errors, keyboard-operable, visible focus, meaningful `alt` text
- [ ] **Loading state implemented** — skeleton/spinner with `role="status"` while data is pending
- [ ] **Error state implemented** — `<ErrorState>` with retry for queries; toast/inline errors for mutations
- [ ] **Empty state implemented** — `<EmptyState>` with action, shown only after a successful zero-item load

## Data & API (backend changes)

- [ ] **Validation complete** — Zod on every `body`/`query`/`params`; ObjectId-validated route params; pagination bounds enforced
- [ ] Standard success/error envelopes and status codes per [docs/API_GUIDELINES.md](../docs/API_GUIDELINES.md)
- [ ] **API documented** — new/changed endpoints reflected in [docs/API_GUIDELINES.md](../docs/API_GUIDELINES.md) (endpoint map, rules) in the same PR
- [ ] No secrets committed; new env vars added to `.env.example` and the validated config module

## Production readiness

- [ ] **Production-ready implementation** — errors handled (never swallowed), no leaked internals in responses, performant defaults (pagination, `.lean()`, indexes)
- [ ] Docs updated in the same PR if architecture, contract, or conventions changed
- [ ] Conventional Commit message; one logical change per commit
- [ ] Results reported honestly — every gate's actual outcome stated, failures and N/As called out
