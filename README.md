# AI Online Examination and Classroom Management System

Monorepo for the Vietnamese classroom and online examination platform. The approved requirements are maintained in [docs/SRS.md](docs/SRS.md); technical defaults and open assumptions are recorded in [docs/DECISIONS.md](docs/DECISIONS.md).

## Prerequisites

- Node.js 22.22.3 or newer in the 22.x line, npm 10+
- Docker Compose v2
- Copy `.env.example` to `.env` and replace every development secret before exposing services

## Local development

```sh
npm install
docker compose up --build -d
npm run db:migrate
npm run db:seed
npm run dev --workspace @classroom/api
npm run start --workspace @classroom/web
```

The API health endpoint is `http://localhost:3000/api/v1/health`; Angular runs on port 4200. Postgres and Redis can also be run through Compose while developing the apps directly on the host.

## Workspace

- `apps/api`: Express API and Prisma data layer
- `apps/web`: Angular standalone application
- `packages/shared`: shared Zod schemas and TypeScript types
- `docker`: local infrastructure and reverse proxy
- `docs`: SRS, decisions, and phase progress
