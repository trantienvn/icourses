# Project ICourses

Repository: `icourses` · Frontend: `icourses-web` · Backend: `icourses-api`.

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
npm run dev --workspace icourses-api
npm run start --workspace icourses-web
```

Before running the seed, set `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, and `SEED_DEMO_PASSWORD` in `.env`; seed passwords must be at least 12 characters. The seed creates one admin, two teachers, thirty students, and a sample class, question, and exam. The demo teacher/student accounts use `SEED_DEMO_PASSWORD` and require a password change on first login.

With Compose, the API health endpoint is `http://localhost/api/v1/health` and API docs are at `http://localhost/api/docs`. For host-based development, Angular runs on port 4200 and `.env` allows that origin. Postgres and Redis can also be run through Compose while developing the apps directly on the host; set `COMPOSE_WEB_ORIGIN` if the Compose site uses a different origin.

## Workspace

- `apps/api` (`icourses-api`): Express API and Prisma data layer
- `apps/web` (`icourses-web`): Angular standalone application
- `packages/shared` (`@icourses/shared`): shared Zod schemas and TypeScript types
- `docker`: local infrastructure and reverse proxy
- `docs`: SRS, decisions, and phase progress
