# Netlify build: database connection

**Direct DB (port 5432) doesn’t work from Netlify** — Supabase’s direct host often isn’t reachable from build runners, so you’ll see `Can't reach database server at db.xxx.supabase.co:5432`. Use the **pooler** only.

**Use the pooler URL for `DATABASE_URL` in Netlify**

1. In **Supabase** → **Settings** → **Database** → **Connection string**.
2. Choose the **Connection pooling** URI (host `aws-0-xx.pooler.supabase.com`, **port 6543**).
3. In **Netlify** → **Site configuration** → **Environment variables**, set:
   - **Key:** `DATABASE_URL`
   - **Value:** that pooler URL, with `?sslmode=require` (and optionally `&pgbouncer=true` if you want it explicit).  
     Example: `postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require`

The build script appends `pgbouncer=true` for the migrate step when it’s not already in the URL, so migrations don’t hang. You can remove **DIRECT_DATABASE_URL** from Netlify; it isn’t used anymore.
