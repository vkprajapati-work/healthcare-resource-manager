# Backend Service

This backend provides the API foundation for the healthcare resource manager monorepo.

## Scripts

- `pnpm --filter @healthcare-resource-manager/backend dev` — start the development server
- `pnpm --filter @healthcare-resource-manager/backend build` — compile TypeScript
- `pnpm --filter @healthcare-resource-manager/backend start` — run the built server
- `pnpm --filter @healthcare-resource-manager/backend typecheck` — validate types
- `pnpm --filter @healthcare-resource-manager/backend lint` — lint the codebase

## Environment

Copy `.env.example` to `.env` and update the values before running the app.

## Structure

- `src/config` — environment, logger, and database setup
- `src/middlewares` — security, logging, and error handling
- `src/modules` — domain modules with controller/service/repository/model patterns
- `src/shared` — shared validation and response helpers

## Notes

The current implementation focuses on infrastructure and production readiness. Feature modules can be added on top of this foundation without major refactoring.
