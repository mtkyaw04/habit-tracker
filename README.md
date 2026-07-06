# Habit Tracker — Full Stack Deployment (3 Docker containers)

```
Browser
   │
   ▼
React Frontend (TanStack Start, Node.js server)   — Container 1, port 8080
   │  HTTP API requests (fetch, JWT bearer token)
   ▼
Node.js Backend (Express)                          — Container 2, port 4000
   │  SQL queries (mysql2)
   ▼
MySQL Database                                     — Container 3, port 3306
```

## What's in this folder

```
deploy/
├── docker-compose.yml     # orchestrates all 3 containers
├── .env.example           # copy to .env and edit
├── frontend/               # your existing React app (Dockerized, unchanged UI/components)
└── backend/                 # new Node.js + Express + MySQL API
```

## Frontend changes — what was (and wasn't) touched

Per your "no change" instruction, **no UI, components, styling, or pages were redesigned**. To make
the app actually persist data in MySQL instead of `localStorage`, three files needed minimal,
mechanical changes (swapping the data source, not the UI):

- `src/lib/habits-store.tsx` — now calls the backend API instead of reading/writing `localStorage`.
  The exported `useHabits()` hook has the **exact same shape** (`habits`, `profile`, `addHabit`,
  `updateHabit`, `deleteHabit`, `toggleComplete`, `updateProfile`), so every component that consumes
  it (`habits.tsx`, `calendar.tsx`, `stats.tsx`, `index.tsx`, `profile.tsx`, `app-shell.tsx`) works
  without modification.
- `src/routes/login.tsx` / `src/routes/register.tsx` — the submit handlers now call the real
  `/api/auth/login` and `/api/auth/register` endpoints and store the returned JWT, instead of faking
  success. Form markup/JSX is untouched.
- `src/components/app-shell.tsx` — added a redirect to `/login` if there's no valid session, since a
  real backend now requires authentication.
- `vite.config.ts` — added `nitro: { preset: "node-server" }` so the build produces a plain Node.js
  server (`node .output/server/index.mjs`) instead of a Cloudflare Worker bundle, so it can run as a
  normal Docker container.
- New file `src/lib/api.ts` — small fetch wrapper (base URL + JWT header handling).

Everything else (all `components/ui/*`, all page layouts, styling, routing structure) is byte-for-byte
identical to what you uploaded.

## Backend (Node.js + Express + MySQL)

REST API in `backend/`:

| Method | Endpoint                | Auth | Description                          |
|--------|--------------------------|------|---------------------------------------|
| POST   | `/api/auth/register`     | –    | Create account, returns JWT           |
| POST   | `/api/auth/login`        | –    | Login, returns JWT                    |
| GET    | `/api/profile`           | ✔    | Get current user's profile            |
| PATCH  | `/api/profile`           | ✔    | Update profile (username/email/avatar/theme) |
| GET    | `/api/habits`            | ✔    | List habits + completions             |
| POST   | `/api/habits`            | ✔    | Create habit                          |
| PATCH  | `/api/habits/:id`        | ✔    | Update habit                          |
| DELETE | `/api/habits/:id`        | ✔    | Delete habit                          |
| POST   | `/api/habits/:id/toggle` | ✔    | Toggle completion for a date          |
| GET    | `/api/health`            | –    | Health check (also pings MySQL)       |

Auth uses a JWT bearer token (`Authorization: Bearer <token>`), password hashing via bcrypt.
MySQL schema (`backend/db/init.sql`) is auto-applied the first time the `mysql` container starts,
via MySQL's `/docker-entrypoint-initdb.d` convention — three tables: `users`, `habits`,
`habit_completions`.

## Running it

1. `cd deploy`
2. `cp .env.example .env` and edit values (at minimum change `JWT_SECRET` and the DB passwords for
   anything beyond local testing).
3. `docker compose up -d --build`
4. Open **http://localhost:8080**, register an account, and start tracking habits.

The backend waits for MySQL to become healthy before starting, and additionally retries its own DB
connection on boot, so container start order is handled automatically.

### Notes on `VITE_API_URL`

The React app is a **client-rendered** SPA at runtime (it calls the API directly from the browser),
so `VITE_API_URL` is baked into the JS bundle at **build time** and must be a URL your **browser** can
reach — not just other containers on the Docker network. For local use, `http://localhost:4000`
(the published port) is correct. For a real deployment, set it to your public backend URL/domain
before building, e.g. `VITE_API_URL=https://api.yourdomain.com`.

### Stopping / resetting

```
docker compose down          # stop containers, keep DB data
docker compose down -v       # stop containers and wipe MySQL data volume
```
