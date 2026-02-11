# Netlify build: migrations not run during build

**Migrations are not run on Netlify** — Running `prisma migrate deploy` during the build was timing out (pooler) or unreachable (direct). The build now only runs `npm ci`, `next build`, and `npm prune`, so it no longer needs a DB connection and should finish within the time limit.

**Run migrations yourself before or after deploying**

From your machine (with production `DATABASE_URL` in `.env` or in the shell):

```powershell
# Option: set env for this session then run migrate
$env:DATABASE_URL = "postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require"
npx prisma migrate deploy
```

Or add the same `DATABASE_URL` to your local `.env`, then run `npx prisma migrate deploy` before you push so the production DB is up to date when the new deploy goes live. You only need to run migrations when you have new migration files (e.g. after `prisma migrate dev`).
