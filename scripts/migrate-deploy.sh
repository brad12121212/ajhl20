#!/usr/bin/env sh
# Use DIRECT_DATABASE_URL for migrations if set (e.g. Netlify); otherwise DATABASE_URL.
# Supabase pooler (port 6543) can hang on migrate; use direct URL (port 5432) in Netlify.
if [ -n "$DIRECT_DATABASE_URL" ]; then
  export DATABASE_URL="$DIRECT_DATABASE_URL"
fi
npx prisma migrate deploy
