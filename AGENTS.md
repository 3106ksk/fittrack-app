# Repository Guidelines

## Project Structure & Module Organization
`frontend/` hosts the Vite + React TypeScript client. Core UI lives in `src/components`, shared logic in `src/hooks` and `src/utils`, API wrappers in `src/services`, and component specs in `src/components/__tests__`. Static assets stay under `public/`.  
`backend/` contains the Express + Sequelize API. HTTP routing resides in `routes/`, business rules in `services/`, data models in `models/`, and schema change artifacts in `migrations/` and `seeders/`. Jest suites are under `tests/`, and `init.sql` seeds a baseline schema for local Postgres.  
Docs and research live in `docs/`, `project-management/`, and `specs/`; use `docker-compose.yml` for end-to-end work with Postgres.

## Build, Test, and Development Commands
- `cd frontend && npm run dev` — start the Vite dev server on http://localhost:5173.
- `cd frontend && npm run build && npm run preview` — build and preview the production bundle.
- `cd backend && npm run dev` — run the API with hot reload (nodemon on port 8000).
- `cd backend && npm run migrate && npm run seed` — apply migrations and seed the dev data set.
- `docker-compose up --build` — launch Postgres, backend, and frontend containers with health checks enabled.

## Coding Style & Naming Conventions
Use two-space indentation, single quotes, and trailing semicolons. React components are PascalCase (`WorkoutSummaryCard.tsx`), hooks camelCase with a `use` prefix, and Sequelize models PascalCase singular (`UserMetric`). Keep feature-specific helpers inside the relevant folder (`src/services/statistics`, `backend/services/health`). Run `npm run lint` in each package; leverage Prettier via the ESLint config or the provided `.prettierrc`. Store secrets in `.env`, `.env.docker`, or runtime platforms—never in source.

## Testing Guidelines
Vitest powers the frontend: place UI specs in `src/components/__tests__/Name.test.tsx`, use `npm run test` for quick feedback, and `npm run test:coverage` before opening a PR. Mock HTTP calls with MSW utilities from `src/mocks`. Jest covers the API layer; integration suites live in `backend/tests/*.test.js`. After schema changes, add migration assertions or update seed fixtures, then verify with `npm run test` and `npm run db:reset`.

## Commit & Pull Request Guidelines
Mirror the Conventional Commit prefixes visible in history (`docs:`, `refactor:`, etc.) and keep subjects in the imperative (“add health score endpoint”). Every PR should include: a concise summary, test commands executed, linked issue or roadmap item, and screenshots or API samples whenever the UI or contract changes. Confirm lint, unit tests, migrations, and docker-compose startup all pass before requesting review.
