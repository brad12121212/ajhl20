#!/usr/bin/env sh
# Run migrations. When using Supabase pooler (port 6543), Prisma needs pgbouncer=true
# or migrations can hang. We append it here for the migrate step only (runtime unchanged).
if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    *pgbouncer=true*) ;;
    *\?*) export DATABASE_URL="${DATABASE_URL}&pgbouncer=true" ;;
    *) export DATABASE_URL="${DATABASE_URL}?pgbouncer=true" ;;
  esac
fi
npx prisma migrate deploy
