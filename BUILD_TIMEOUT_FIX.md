# Netlify build timeout fix

If the build fails with **"Command did not finish within the time limit"** and the log shows it hanging during `prisma migrate deploy`, the cause is usually running migrations through **Supabase's connection pooler** (port 6543). The pooler can hang on migration commands.

**Fix: set `DIRECT_DATABASE_URL` in Netlify**

1. In **Supabase** → your project → **Settings** → **Database**.
2. Under **Connection string**, choose **URI** and copy the **direct** connection string (host `db.xxxx.supabase.co`, **port 5432**). It looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   Add `?sslmode=require` at the end.
3. In **Netlify** → your site → **Site configuration** → **Environment variables**.
4. Add a new variable:
   - **Key:** `DIRECT_DATABASE_URL`
   - **Value:** the direct connection string from step 2 (port 5432)
   - **Scopes:** All
5. **Save** and trigger a new deploy (**Deploys** → **Trigger deploy** → **Deploy site**).

The build script uses `DIRECT_DATABASE_URL` only for `prisma migrate deploy`. Your app at runtime still uses `DATABASE_URL` (the pooler, port 6543), which is correct for production.
