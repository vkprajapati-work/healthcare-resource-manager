---
name: new-shared-package
description: Extract shared Zod schemas/DTO types into a packages/shared workspace. Use ONLY when the extraction trigger is met - the same schema or type has been edited in both apps more than once. Do not use preemptively.
---

# New Shared Package

Create the `packages/shared` workspace per the strategy in [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) §9.

## Check the trigger first

Extraction is justified only when **the same schema/type has been edited in both `apps/frontend` and `apps/backend` more than once**. If the duplication has only appeared once, or exists in one app only — stop and tell the user extraction is premature (rule of three, [docs/PROJECT_RULES.md](../../../docs/PROJECT_RULES.md) #11).

## Steps

1. **Add the workspace glob.** In `pnpm-workspace.yaml`, add `packages/*` to the `packages` list (keep `apps/*`).

2. **Scaffold the package:**

   ```text
   packages/shared/
   ├── src/
   │   ├── schemas/     # shared Zod schemas
   │   ├── types/       # shared DTO types (z.infer re-exports)
   │   └── index.ts     # public API — re-exports only
   ├── package.json     # name: "@hrm/shared", private, type-safe exports
   └── tsconfig.json    # strict, extends the repo's base conventions
   ```

   The package must implement the shared task names (`build`, `lint`, `typecheck`) so Turborepo orchestrates it; downstream `build` already depends on `^build` in `turbo.json`.

3. **Move, don't copy.** Relocate the duplicated schemas/types into `packages/shared/src`, then delete both app-local copies and update imports to `@hrm/shared`.

4. **Wire consumers.** Add `"@hrm/shared": "workspace:*"` to both apps' dependencies and run `pnpm install`.

5. **Scope discipline.** Only validation schemas and types go in — **never** runtime server code (models, services, Express/Mongoose imports are forbidden in this package). It must stay importable by the browser bundle.

6. **Document.** Update [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) (§2 monorepo tree and §9) and the root README structure diagram in the same PR.

7. **Verify.** `pnpm install`, then run the `/verify` skill across the repo.
