# FasalFlux Prototype

Frontend-first prototype with the existing UI preserved and a lightweight mock API backend.

## Run locally

```bash
npm install
npm run dev
```

This starts:

- Frontend: Vite (default `http://localhost:5173`)
- Mock API: Node HTTP server (`http://localhost:5000`)

Vite proxies `/api/*` requests to the mock API, so the existing frontend API calls continue to work without changing the UI.

## Deploy

Build with `npm run build` and publish the generated `dist` folder. If the API is deployed separately, set `VITE_API_URL` to its public URL before building. Leave it unset when the frontend and API share the same origin. For a deployment under a sub-path, set `VITE_BASE_PATH` before building, such as `/fasalflux/`.

## Prototype architecture

React + TypeScript + Vite → API client → Mock API → in-memory data

The mock API resets its data whenever the server restarts. No PostgreSQL, Prisma, Redis, real SMS, DBT, or production authentication is included in this prototype.

## Code structure

The current UI remains intentionally stable in `src/App.tsx`. A future refactor can move farmer pages, official pages, shared layout/components, frontend services/types, and mock API routes/services/data into the prepared folders without changing the UI or flow. See `docs/ARCHITECTURE.md`.
