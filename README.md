# Healthcare Resource Manager

A full-stack platform for finding and managing healthcare resources — ambulances and doctors — in emergencies. Anyone can browse a paginated, always-communicative list of nearby ambulances and doctors with no login required; admins get a dashboard to manage doctors, drivers, and vehicles with rich profiles, document/photo uploads, and provisioned logins.

## Live demo

|                 |                                              |
| --------------- | -------------------------------------------- |
| **App**         | [http://54.235.96.72/](http://54.235.96.72/) |
| **API**         | `http://54.235.96.72/api/v1`                 |
| **Admin login** | `admin@healthcare.local` / `Admin@123`       |

> ⚠️ This is a shared demo instance on plain HTTP with a known default password — do not enter real personal data, and rotate this password (`POST /auth/change-password`) before treating this as anything beyond a throwaway demo. The public IP isn't static (no Elastic IP attached), so this URL may change if the instance restarts.

## Contents

- [Live demo](http://54.235.96.72/)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running the app](#running-the-app)
- [Default admin login](#default-admin-login)
- [Available scripts](#available-scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

## Features

**Public**

- Paginated resource list (10/page) of ambulances and doctors, filterable by type, with total counts
- Loading, error, and empty states everywhere — never a blank screen
- Resource images with graceful fallback when missing or broken

**Auth**

- Cookie-session login (`httpOnly` access + refresh tokens), silent refresh-token retry, role-gated routes
- Forced password rotation for freshly-provisioned accounts (`mustChangePassword`)

**Admin dashboard**

- Full CRUD-style management for **doctors**, **drivers**, and **vehicles**, each with rich profiles (license/registration numbers, specialization, availability, assigned-vehicle relationships, etc.)
- Multipart image/document upload (profile photos, vehicle photos, identity/qualification documents) with per-category MIME/size validation
- One-time provisioned-login reveal when creating a doctor/driver account
- `GET /resources` bridges in doctors and vehicles read-only, so anything created through their own rich APIs also shows up in the public list without duplicate records

**Platform**

- Every list endpoint paginated (default 10, max 100); every input validated with Zod at the boundary
- Centralized error envelope (`{ success, data | error }`) across the entire API
- Standard security middleware: `helmet`, explicit CORS allow-list, rate limiting, mongo-sanitize, hpp
- CI-free, automated deploy to EC2 on every push to `main` via GitHub Actions

## Tech stack

| Area       | Technology                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Monorepo   | pnpm Workspaces, Turborepo                                                                                                    |
| Frontend   | React 18, TypeScript (strict), Vite, React Router v6, TanStack Query v5, Axios, Tailwind CSS, shadcn/ui, React Hook Form, Zod |
| Backend    | Node.js (≥ 20), Express, TypeScript, MongoDB, Mongoose, Zod, JWT (`jsonwebtoken`), `bcrypt`, `multer`, `winston`              |
| Testing    | Jest + React Testing Library (frontend), Jest + Supertest (backend)                                                           |
| Tooling    | Prettier, ESLint (flat config per app)                                                                                        |
| Deployment | Ubuntu EC2, nginx (reverse proxy + static hosting), PM2, GitHub Actions (SSH-based auto-deploy on push to `main`)             |

Full rationale for every choice: [docs/TECH_STACK.md](docs/TECH_STACK.md).

## Repository structure

```text
healthcare-resource-manager/
│
├── apps/
│   ├── frontend/              # React 18 SPA — feature-based (src/features/<feature>/{api,components,hooks,schemas,types})
│   │   ├── src/features/      # admin, auth, doctors, drivers, resources, vehicles
│   │   └── .env.example
│   │
│   └── backend/               # Express API — layered domain modules (routes → controller → service → model)
│       ├── src/modules/       # auth, doctors, drivers, files, health, resources, seed
│       └── .env.example
│
├── docs/                      # Living documentation (architecture, coding standards, API guidelines, tech stack rationale)
├── .ai/                       # AI workflow, reusable prompts, Definition of Done checklist
├── .github/workflows/         # CI/CD — auto-deploy to EC2 on push to main
│
├── package.json                # Root workspace manifest and scripts
├── pnpm-workspace.yaml         # pnpm workspace definition
├── turbo.json                  # Turborepo task pipeline
└── README.md
```

Shared packages (e.g. common Zod schemas/DTO types used by both apps) will be introduced under `packages/shared` once the same schema has been duplicated across both apps more than once — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §9.

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 — install via Corepack (bundled with Node ≥ 16.9):
  ```bash
  corepack enable
  corepack prepare pnpm@9.3.0 --activate
  ```
  or `npm install -g pnpm@9.3.0` if Corepack isn't available
- **MongoDB** — either a local instance (`mongod` running on `127.0.0.1:27017`) or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string

## Getting started

```bash
# 1. Clone and enter the repo
git clone <repo-url> healthcare-resource-manager
cd healthcare-resource-manager

# 2. Install every workspace's dependencies in one shot
pnpm install

# 3. Create env files from the committed examples
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 4. Edit apps/backend/.env — at minimum set:
#    - MONGODB_URI (uncomment/point at your local Mongo or Atlas cluster)
#    - ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET (any long random string)

# 5. Start everything
pnpm dev
```

The frontend comes up at `http://localhost:5173`, the API at `http://localhost:5000/api/v1`.

## Environment variables

Both apps read configuration only through a validated env module (Zod-parsed at startup — an invalid or missing required variable fails fast with a clear error). Never read `process.env` directly elsewhere in the code, and never commit a real `.env` file.

**`apps/backend/.env`** (see [apps/backend/.env.example](apps/backend/.env.example) for the full, commented list):

| Variable                                                                | Required | Notes                                                                                                                                                                               |
| ----------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                                                                  |          | Defaults to `5000`                                                                                                                                                                  |
| `NODE_ENV`                                                              |          | `development` \| `test` \| `production`                                                                                                                                             |
| `MONGODB_URI`                                                           | ✅       | e.g. `mongodb://127.0.0.1:27017/healthcare-resource-manager` or an Atlas SRV string                                                                                                 |
| `CLIENT_URL`                                                            |          | Comma-separated list of allowed CORS origins (e.g. a deployed origin plus a local dev origin); unset allows any origin (dev only — never in prod)                                   |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`                          | ✅       | Long random strings — never reuse the placeholder values                                                                                                                            |
| `ACCESS_TOKEN_EXPIRES_IN` / `REFRESH_TOKEN_EXPIRES_IN`                  |          | Default `15m` / `7d`                                                                                                                                                                |
| `COOKIE_SECURE`                                                         |          | Set `true` once served over HTTPS — a `Secure` cookie is silently dropped by browsers over plain HTTP                                                                               |
| `COOKIE_SAME_SITE`                                                      |          | Default `lax`                                                                                                                                                                       |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`                                        |          | Set both to seed a known admin login on first boot; leave `ADMIN_PASSWORD` empty to have a random one generated and logged once; leave `ADMIN_EMAIL` empty to skip seeding entirely |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`                               |          | Request rate limiting                                                                                                                                                               |
| `MAX_UPLOAD_SIZE_BYTES`, `*_MAX_UPLOAD_FILES`, `ALLOWED_*_MIME_TYPES`   |          | File upload limits per module                                                                                                                                                       |
| `FILE_STORAGE_PROVIDER` / `LOCAL_STORAGE_ROOT` / `FILE_PUBLIC_BASE_URL` |          | Only `LOCAL` disk storage is implemented today                                                                                                                                      |

**`apps/frontend/.env`** (see [apps/frontend/.env.example](apps/frontend/.env.example)):

| Variable              | Notes                                                                     |
| --------------------- | ------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`   | Backend base URL, no trailing slash — e.g. `http://localhost:5000/api/v1` |
| `VITE_API_TIMEOUT_MS` | Request timeout in ms, default `15000`                                    |
| `VITE_APP_NAME`       | Display name used in layouts and the document title                       |

## Running the app

```bash
# Both apps together (via Turborepo)
pnpm dev

# One app at a time
pnpm --filter backend dev
pnpm --filter frontend dev
```

> **Windows note:** the backend's `dev` script runs via `node --import tsx --watch` rather than `tsx watch` directly — Turborepo's persistent-task process handling breaks `tsx watch`'s internal fork-based restart on some Windows setups (it hangs silently with no error). Node's native `--watch` flag avoids that entirely.

## Default admin login

If you set `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `apps/backend/.env`, that account is seeded automatically on first backend startup. Log in at `/login`, then immediately rotate the password via the change-password flow (`POST /api/v1/auth/change-password`) if this is anything beyond a local throwaway instance — a known default/seeded password left unrotated on a publicly reachable deployment is a real credential-exposure risk, not just a local dev convenience.

## Available scripts

Run from the repository root, orchestrated across workspaces by Turborepo:

| Script                              | Description                                        |
| ----------------------------------- | -------------------------------------------------- |
| `pnpm dev`                          | Start all apps in development mode                 |
| `pnpm build`                        | Build all apps (dependency-aware, cached)          |
| `pnpm lint`                         | Lint all apps                                      |
| `pnpm typecheck`                    | Type-check all apps                                |
| `pnpm test`                         | Run all test suites                                |
| `pnpm format` / `pnpm format:check` | Format / verify formatting repo-wide with Prettier |
| `pnpm clean`                        | Remove build artifacts across apps                 |

Target a single app with `pnpm --filter <app> <script>` (`app` is `frontend` or `backend`).

## Testing

- **Frontend:** Jest + React Testing Library — `pnpm --filter frontend test`
- **Backend:** Jest + Supertest — `pnpm --filter backend test`

## Deployment

The backend and frontend are deployed together on a single Ubuntu EC2 instance: nginx reverse-proxies `/api` and `/uploads` to the Express API (managed by PM2) and serves the built frontend as static files.

Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which SSHes into the instance and:

1. Resets the working tree to the pushed commit (`git fetch && git reset --hard origin/main`)
2. Reinstalls dependencies (`pnpm install --frozen-lockfile`)
3. Rebuilds the backend, then the frontend, **sequentially** — running both builds concurrently exhausts memory on a small instance
4. Restarts the API process (`pm2 restart backend --update-env`)

Required GitHub Actions repository secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` (the SSH private key for the instance).

## Documentation

Living documentation lives in [`docs/`](docs) and is kept in sync with the code in the same PR that changes it:

| Doc                                                     | Covers                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md)           | Full business/product context and design decisions                  |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)                 | Directory trees, dependency rules, when to extract a shared package |
| [TECH_STACK.md](docs/TECH_STACK.md)                     | Rationale for every technology choice                               |
| [CODING_STANDARDS.md](docs/CODING_STANDARDS.md)         | Naming, commit conventions, import ordering                         |
| [COMPONENT_GUIDELINES.md](docs/COMPONENT_GUIDELINES.md) | Frontend component conventions                                      |
| [API_GUIDELINES.md](docs/API_GUIDELINES.md)             | Request/response envelope, error codes, versioning                  |
| [PROJECT_RULES.md](docs/PROJECT_RULES.md)               | Mandatory rules for how this repo is worked on                      |

## License

[MIT](LICENSE)
