# Architecture

Gantabya is two apps in one repo:

- `frontend/`: Next.js 15 (App Router). Most pages are client components that call the API. Trail pages (`/trails/[id]`) are server-rendered so shared links have real content and previews.
- `server/`: an Express + socket.io API in TypeScript, backed by PostgreSQL (Drizzle ORM), with optional Redis and Cloudflare R2.

```
Browser ──HTTPS──▶ Netlify (Next.js) ──fetch (SSR)──┐
   │                                                ▼
   ├──── REST /api/v1/* ───────────────▶ Render: gantabya-api ──▶ Render Postgres
   ├──── socket.io (wss) ──────────────▶        │        │
   └──── media (/media/* or R2_PUBLIC_URL) ◀────┘        ├──▶ Cloudflare R2
                                                         └──▶ Render Key Value (Redis)
```

## Request flow

1. A request hits Express. Global middleware runs first: security headers, CORS (origins from `CLIENT_URL`), JSON body parsing, request logging and rate limiting (in memory, or in Redis when `REDIS_URL` is set so limits are shared across instances).
2. It is routed to a feature module mounted under `/api/v1/<module>`.
3. The module's route validates input, runs auth middleware if needed, and calls a controller/service that queries Postgres through Drizzle (`server/src/db/schema.ts`).
4. Errors are thrown and handled by one central error handler that returns a consistent JSON error shape.

Non-API routes: `GET /health` (used by Docker, Render and Compose health checks) and `GET /media/*` (media proxy, see below).

## Auth

- Sign-up/login return a JWT signed with `JWT_SECRET`, valid for `JWT_EXPIRES_IN` (default 7 days). Passwords are hashed with bcrypt.
- HTTP: the client sends `Authorization: Bearer <token>`. Auth middleware verifies it and attaches the user to the request. Protected routes reject missing or invalid tokens with 401.
- Sockets: the client passes the token in the socket.io handshake (`auth: { token }`). A connection middleware verifies it before any handler runs and stores the user on `socket.data`. Unauthenticated connections are refused.

## Storage

Uploads go through the API (multipart), never straight from the browser to the bucket.

- **R2**: when `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are set, files are written to bucket `R2_BUCKET` at `R2_ENDPOINT` using the S3 API.
- **Disk fallback**: without R2 keys (typical in local dev), files are written to the local uploads directory.
- **Media URLs**: if `R2_PUBLIC_URL` is set, stored links point at the public bucket domain. Otherwise links are `PUBLIC_API_URL/media/<key>` and the API streams the object from R2 (or disk), so the bucket can stay private.
- `npm run migrate:uploads` moves files from the legacy uploads folder to R2 and rewrites stored URLs.

## Realtime

- socket.io is attached to the same HTTP server as Express, with the same CORS origins.
- When `REDIS_URL` is set, the `@socket.io/redis-adapter` is used so events reach clients connected to any instance. Without it, a single-instance in-memory adapter is used.
- Handlers use rooms (for example one per trail or group) so events go only to the people who need them.

## Adding a backend module

1. Create `server/src/modules/<name>/` with its pieces, for example:
   ```
   server/src/modules/<name>/
   ├── <name>.schema.ts       Drizzle table definition
   ├── <name>.validators.ts   request validation (zod)
   ├── <name>.controller.ts   HTTP handlers
   ├── <name>.service.ts      business logic
   ├── <name>.routes.ts       Express router (exports the router)
   └── (tests in server/tests/)
   ```
   Re-export the table from `server/src/db/schema.ts`, then run `npm run db:generate` to create a migration in `server/drizzle/`.
2. Register the router in `server/src/modules/index.ts` so it is mounted at `/api/v1/<name>`.
3. Use the existing auth middleware for protected routes and throw errors for the central error handler instead of sending error responses by hand.
4. Add tests. They run against PGlite (in-process Postgres), so no database is needed.

## Adding a socket handler

1. Create `server/src/sockets/<name>.ts` exporting a function that receives the `io` server and the authenticated `socket`, and registers its events (`socket.on('<name>:event', …)`). Prefix event names with the feature name.
2. Register it in `server/src/sockets/index.ts`, which calls each handler on every new connection.
3. Validate incoming payloads, check the user is allowed in the room before joining or emitting, and use `socket.data` for the current user.
