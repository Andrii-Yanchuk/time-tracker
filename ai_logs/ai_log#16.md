# AI Log #16 — Supabase (PostgreSQL) migration verification

## Goal
Verify the project’s database integration after migrating from SQLite to Supabase (PostgreSQL), without refactoring architecture.

## Verification performed
### Prisma schema
- Confirmed datasource provider is `postgresql`.
- Confirmed datasource uses `env("DATABASE_URL")`.
- Added missing `directUrl = env("DIRECT_URL")` to match recommended Supabase/Prisma setup.

### Prisma Client
- Confirmed `prisma` and `@prisma/client` are installed.
- Confirmed Prisma Client singleton is used via `src/lib/prisma.ts` (global caching in dev).
- Noted that there is no explicit `postinstall` script for `prisma generate` in `package.json` (may matter for some CI/Vercel builds).

### Codebase SQLite cleanup
- Searched for runtime SQLite usage (`sqlite`, `dev.db`, `file:`) in `src/`.
- No SQLite references found in runtime code.
- SQLite references remain in documentation (`README.md`).

### Repository and API usage
- Repositories use Prisma correctly (`prisma.project`, `prisma.timeEntry`, `prisma.taskName`) with no file-path DB usage.
- API routes verified for required operations:
  - `POST /api/projects` (Create Project)
  - `POST /api/time-entries` (Create TimeEntry)
  - `PATCH /api/time-entries/[id]` (Update TimeEntry)
  - `DELETE /api/time-entries/[id]` (Delete TimeEntry)

### Temporary write confirmation log
- Added temporary `console.log` on successful write in `POST /api/time-entries` to confirm DB inserts are happening.

### Health check endpoint
- Added `GET /api/health` (`src/app/api/health/route.ts`) which runs `prisma.$queryRaw\`SELECT 1\`` and returns `{ status: "ok" }` if DB is reachable.

## Files changed
- `prisma/schema.prisma`
  - Added `directUrl = env("DIRECT_URL")`
- `src/app/api/time-entries/route.ts`
  - Added temporary `console.log` after a successful create
- `src/app/api/health/route.ts`
  - Added minimal DB connectivity check route

## Notes for Vercel deployment
- Ensure both env vars are set: `DATABASE_URL` and `DIRECT_URL`.
- Consider adding `postinstall: prisma generate` (or equivalent) to avoid missing Prisma Client during builds.
- Migrations are not automatically applied on deploy; handle via CI (`prisma migrate deploy`) if needed.
- Prisma must run in Node runtime (avoid Edge runtime for DB routes).
