# Healthcare Resource Manager

A monorepo for the Healthcare Resource Manager application — a platform for managing healthcare resources such as ambulances and doctors.

## Repository Structure

```text
healthcare-resource-manager/
│
├── apps/
│   ├── frontend/        # React 18 + Vite + TypeScript SPA (to be implemented)
│   └── backend/         # Node.js + Express + TypeScript API (to be implemented)
│
├── package.json         # Root workspace manifest and scripts
├── pnpm-workspace.yaml  # pnpm workspace definition
├── turbo.json           # Turborepo task pipeline
├── .gitignore
├── .editorconfig
├── .prettierrc
├── .prettierignore
├── README.md
└── LICENSE
```

Shared packages (e.g. common types, validation schemas) can be introduced later under a `packages/` directory when the need arises.

## Tech Stack

| Area     | Technology                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| Monorepo | pnpm Workspaces, Turborepo                                                                                           |
| Frontend | React 18, TypeScript, Vite, React Router v6, TanStack Query v5, Axios, Tailwind CSS, shadcn/ui, React Hook Form, Zod |
| Backend  | Node.js, Express.js, TypeScript, MongoDB, Mongoose                                                                   |

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`corepack enable` or `npm i -g pnpm`)

## Getting Started

```bash
# Install all workspace dependencies
pnpm install
```

## Scripts

All scripts run from the repository root and are orchestrated across workspaces by Turborepo.

| Script              | Description                                |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Start all apps in development mode         |
| `pnpm build`        | Build all apps (dependency-aware, cached)  |
| `pnpm lint`         | Lint all apps                              |
| `pnpm typecheck`    | Type-check all apps                        |
| `pnpm format`       | Format the entire repository with Prettier |
| `pnpm format:check` | Verify formatting without writing changes  |
| `pnpm clean`        | Remove build artifacts across apps         |

To run a script for a single app:

```bash
pnpm --filter frontend dev
pnpm --filter backend dev
```

## Workspace Conventions

- Each app under `apps/` is a self-contained workspace with its own `package.json`, and must implement the shared task names (`dev`, `build`, `lint`, `typecheck`) so Turborepo can orchestrate them.
- Strict TypeScript is required in every workspace.
- Code style is enforced repo-wide via Prettier and EditorConfig.
- Environment variables live in per-app `.env` files (never committed); provide a committed `.env.example` documenting required variables.

## License

[MIT](LICENSE)
