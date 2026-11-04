# Gantabya

Gantabya is a travel companion app for group trips and city-to-city travel. Plan and share trails, see them on a map, and keep your group coordinated and safe on the road.

https://github.com/user-attachments/assets/fbbb3edc-397b-421f-961c-1315e499b2cd

## Features

**Available now**

- Accounts with email/password sign-in (JWT)
- Trail definition: create, edit and share travel trails on a Mapbox map
- Shareable, server-rendered trail pages (`/trails/[id]`)
- Photo uploads for trails and profiles (Cloudflare R2, with a local-disk fallback in development)
- Realtime updates over socket.io

**Coming soon**

- Trips and groups
- Live location sharing
- Threaded (Reddit-style) in-app chat
- Notifications
- Weather along trails
- Nearby facilities via OpenStreetMap
- SOS alerts
- Google sign-in
- PWA / offline support

## Tech stack

| Area | Tech |
| --- | --- |
| Frontend | Next.js 15 (App Router), React, TypeScript, Mapbox GL, Vitest |
| Backend | Node.js 20, Express, TypeScript, socket.io, Vitest |
| Data | PostgreSQL (Drizzle ORM), Redis (optional: socket.io adapter and shared rate limits) |
| Storage | Cloudflare R2 (S3-compatible), disk fallback in dev |
| Hosting | Netlify (frontend), Render (API + Postgres + Key Value) |
| CI | GitHub Actions, Dependabot |

## Repo layout

```
.
├── frontend/              Next.js 15 app (App Router, TypeScript)
│   └── src/app/           routes, incl. trails/[id]
├── server/                Express + socket.io API (TypeScript)
│   ├── src/modules/       feature modules (routes, controllers, models)
│   ├── src/sockets/       socket.io event handlers
│   └── Dockerfile         multi-stage production image
├── docs/
│   └── ARCHITECTURE.md    request flow, auth, storage, realtime
├── .github/               CI workflow and Dependabot config
├── docker-compose.yml     local Postgres + Redis + API
├── render.yaml            Render blueprint (API + Postgres + Key Value)
├── netlify.toml           Netlify build config for the frontend
└── .nvmrc                 Node version (20)
```

## Quick start (Docker)

Requires Docker with Compose v2 and Node 20 (`nvm use`).

```bash
# 1. API + Postgres + Redis on http://localhost:5000
docker compose up --build

# 2. Frontend on http://localhost:3000 (in another terminal)
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_MAPBOX_TOKEN
npm install
npm run dev
```

Compose works without a `server/.env`. Uploads are stored on disk unless you add R2 keys to `server/.env` (see [Cloudflare R2](#cloudflare-r2)). Check the API with `curl http://localhost:5000/health`.

## Manual setup (without Docker)

You need Node 20, a PostgreSQL database and, optionally, Redis. Migrations run automatically when the server starts; `npm run seed` loads demo data.

```bash
# API
cd server
cp .env.example .env         # set DATABASE_URL and JWT_SECRET at minimum
npm install
npm run dev                  # http://localhost:5000

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev                  # http://localhost:3000
```

## Environment variables

### Server (`server/.env`)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | **yes** | | Postgres connection string |
| `DATABASE_SSL` | no | on in production | Set `false` for internal/local connections without TLS |
| `JWT_SECRET` | **yes** | | Secret for signing JWTs. Use a long random value |
| `NODE_ENV` | no | `development` | `development`, `test` or `production` |
| `PORT` | no | `5000` | HTTP port |
| `JWT_EXPIRES_IN` | no | `7d` | Token lifetime |
| `CLIENT_URL` | no | | Comma-separated list of allowed frontend origins (CORS and socket.io) |
| `PUBLIC_API_URL` | no | | Public base URL of this API, used to build `/media/*` links |
| `R2_ENDPOINT` | no | `https://cef3bc5e60493c2cde2fa645dac8c39f.r2.cloudflarestorage.com` | R2 S3 endpoint |
| `R2_BUCKET` | no | `gantabya` | R2 bucket name |
| `R2_ACCESS_KEY_ID` | for R2 | | R2 API token access key. Without it, uploads go to local disk |
| `R2_SECRET_ACCESS_KEY` | for R2 | | R2 API token secret |
| `R2_PUBLIC_URL` | no | | Public bucket domain (r2.dev or custom). If unset, media is proxied through `/media/*` |
| `REDIS_URL` | no | | Enables the socket.io Redis adapter and shared rate limits |

### Frontend (`frontend/.env.local`, Netlify env)

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | **yes** | Base URL of the API, e.g. `http://localhost:5000` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | **yes** | Mapbox public token (`pk.…`), restricted to your domains |

## Scripts

| Server (`cd server`) | |
| --- | --- |
| `npm run dev` | Start with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`dist/server.js`) |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run migrate:uploads` | One-off: move legacy uploads to R2 |

| Frontend (`cd frontend`) | |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm test` | Vitest |

## Testing

```bash
cd server && npm test      # uses PGlite (in-process Postgres), no services needed
cd frontend && npm test
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, test and build for both apps on every push and pull request, then builds the server Docker image.

## Deployment

The frontend runs on Netlify, the API on Render, the database on Render Postgres and media on Cloudflare R2.

### How the URLs relate

- `PUBLIC_API_URL` (server) = the Render URL of the API, e.g. `https://gantabya-api.onrender.com`.
- `NEXT_PUBLIC_API_URL` (frontend) = the same URL.
- `CLIENT_URL` (server) = the frontend origin(s), comma-separated, with no trailing slash, e.g. `https://gantabya.netlify.app,https://gantabya.example.com`. Requests from any other origin are rejected by CORS and socket.io.

### Database

`render.yaml` creates a Render Postgres database (`gantabya-db`) and wires its internal connection string into `DATABASE_URL`, so there is nothing to set by hand. Schema migrations in `server/drizzle/` run on every start. To use another provider (Neon, Supabase, …), replace `DATABASE_URL` with its connection string and leave `DATABASE_SSL` unset so TLS is used.

Render's free Postgres expires after 30 days; upgrade the plan or move the data before then.

### Cloudflare R2

1. In Cloudflare → R2, create the bucket `gantabya` (if it does not exist).
2. **Manage R2 API Tokens → Create API token** with **Object Read & Write**, scoped to bucket `gantabya`.
3. Put the keys in `server/.env` locally and in the Render dashboard for production. Never commit them.
   ```
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   ```
4. Optional public access: enable the bucket's `r2.dev` subdomain or connect a custom domain, and set `R2_PUBLIC_URL` to it (e.g. `https://media.example.com`). If `R2_PUBLIC_URL` is not set, the bucket stays private and the API streams media through `/media/*`.
5. If you set `R2_PUBLIC_URL`, add a CORS policy on the bucket (**Settings → CORS policy**) so the frontend can fetch media:
   ```json
   [
     {
       "AllowedOrigins": [
         "http://localhost:3000",
         "https://gantabya.netlify.app"
       ],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
   Uploads go through the API, so browsers never need `PUT` access to the bucket.

### Render (API)

1. Render dashboard → **New → Blueprint**, pick this repo. `render.yaml` creates:
   - `gantabya-api`: Docker web service built from `server/Dockerfile`, health check `/health`
   - `gantabya-db`: Postgres database, wired into `DATABASE_URL`
   - `gantabya-redis`: free Key Value instance, wired into `REDIS_URL`
2. `JWT_SECRET` is generated automatically. Fill in the variables marked `sync: false` when prompted: `CLIENT_URL`, `PUBLIC_API_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `RESEND_API_KEY`, and optionally `R2_PUBLIC_URL`.
3. After the first deploy, set `PUBLIC_API_URL` to the service URL if you did not know it in advance.

The free plan sleeps after inactivity, so the first request after a while is slow.

### Netlify (frontend)

1. **Add new site → Import from Git**, pick this repo. `netlify.toml` sets base `frontend`, the Next.js runtime and Node 20.
2. **Site configuration → Environment variables**: set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MAPBOX_TOKEN`, then redeploy (they are inlined at build time).
3. Add the Netlify URL (and any custom domain) to `CLIENT_URL` on Render.

### Migrating legacy uploads

Older versions stored uploads in `server/uploads/`. To move them to R2 and rewrite the stored URLs, with the R2 keys and `DATABASE_URL` set:

```bash
cd server
npm run migrate:uploads -- --dry-run   # show what would change
npm run migrate:uploads                # do it
```

## Security note

Secrets (old MongoDB credentials, the JWT secret and the Mapbox token) were committed to this repository's git history in the past. Removing them from the current files does not remove them from history, so treat them as leaked:

- **Delete or rotate the old MongoDB Atlas database user** (the app no longer uses MongoDB).
- **Generate a new `JWT_SECRET`** (this logs everyone out).
- **Revoke and recreate the Mapbox token**, and restrict the new one to your domains.

Keep secrets in `.env` files (git-ignored) and in the Netlify/Render dashboards only.

## Contributing

1. Fork the repo and create a branch.
2. `nvm use`, then make your change with tests.
3. Make sure `npm run lint && npm run typecheck && npm test` pass in the app you touched.
4. Open a pull request.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the backend is organised.

## License

MIT.

Happy travels with Gantabya!
