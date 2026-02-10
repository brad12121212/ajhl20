# PostgreSQL setup (Supabase) for AJHL

The app is now configured for **PostgreSQL** only. Use the steps below to get a database and run migrations.

---

## 1. Create a PostgreSQL database (Supabase)

1. Go to **[supabase.com](https://supabase.com)** and sign in (or create an account).
2. Click **New project**.
3. **Name:** e.g. `ajhl`  
   **Database password:** Choose a strong password and **save it** (you’ll need it for the connection string).
4. Pick a region close to you, then click **Create new project**.
5. Wait until the project is ready (1–2 minutes).

---

## 2. Get the connection string

1. In the Supabase project, open **Settings** (gear icon) → **Database**.
2. Scroll to **Connection string**.
3. Choose the **URI** tab.
4. Copy the connection string. It looks like:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
5. Replace **`[YOUR-PASSWORD]`** with the database password you set when creating the project.
6. If Supabase shows a **Transaction** mode (port **6543**) and **Session** mode (port **5432**), use **Transaction** (port **6543**) for serverless/Netlify. Add `?sslmode=require` at the end if it’s not there:
   ```text
   postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

---

## 3. Use it locally

1. In your project folder, copy the example env file (if you don’t have a `.env` yet):
   ```powershell
   copy .env.example .env
   ```
2. Open **`.env`** and set:
   - **`DATABASE_URL`** = the Supabase connection string (with your real password).
   - **`SESSION_SECRET`** = any long random string (e.g. 32+ characters).
3. Install deps and run migrations:
   ```powershell
   npm install
   npx prisma migrate deploy
   npx prisma generate
   ```
4. (Optional) Seed test data:
   ```powershell
   npm run db:seed
   ```
5. Start the app:
   ```powershell
   npm run dev
   ```
6. Open **http://localhost:3000** and confirm login/registration and events work.

---

## 4. Use the same database on Netlify (ajhl20)

You already have a Netlify project **ajhl20**. Point it at the same Supabase database.

1. In **[app.netlify.com](https://app.netlify.com)** open site **ajhl20**.
2. Go to **Site configuration** → **Environment variables**.
3. Add or edit:
   - **`DATABASE_URL`** = same Supabase connection string as in your `.env` (same DB = same data).
   - **`SESSION_SECRET`** = same value as in `.env` (or another long random string; must be 16+ chars).
   - **`NODE_ENV`** = `production`.
4. Save.
5. Deploy (or trigger a new deploy):
   ```powershell
   netlify deploy --prod
   ```
   Migrations run as part of the build if your build command includes `prisma migrate deploy`; otherwise run once from your machine with `DATABASE_URL` set to the same URL (see NETLIFY_SETUP.md).

---

## 5. If the build runs migrations

In **`netlify.toml`** the build command can be:

```toml
[build]
  command = "npx prisma migrate deploy && npm run build"
```

Then every deploy will run migrations against the database specified by **`DATABASE_URL`** in Netlify. Make sure **`DATABASE_URL`** is set in Netlify to your Supabase URL.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create Supabase project, save DB password |
| 2 | Copy connection string, replace `[YOUR-PASSWORD]`, add `?sslmode=require` if needed |
| 3 | Put `DATABASE_URL` and `SESSION_SECRET` in `.env`, run `npx prisma migrate deploy` and `npm run dev` |
| 4 | Add same `DATABASE_URL` and `SESSION_SECRET` (and `NODE_ENV=production`) in Netlify → ajhl20 |
| 5 | Deploy with `netlify deploy --prod` (migrations run in build if configured) |

Your SQLite data is not migrated automatically. If you need existing users/events in Postgres, you’ll need to re-seed or export/import that data separately.
