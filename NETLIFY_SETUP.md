# Netlify setup — exact steps

Follow these in order. Nothing here requires you to commit or upload any passwords or secrets; those stay in Netlify’s dashboard (or your local `.env`, which is never deployed).

---

## 1. What’s already protected

- **API routes**  
  All sensitive APIs use session auth (`getSession()`). No API keys or passwords are in the browser or in client-side code.

- **Secrets**  
  `DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, and `EMAIL_FROM` are only used on the server. They are **never** in the repo. You set them in Netlify’s Environment variables (see below); Netlify injects them at build/runtime only.

- **Repo / deploy**  
  `.env*` and `TEST_ACCOUNTS.md` are in `.netlifyignore`, so they are never uploaded or deployed. Only the code and non-secret config are deployed.

- **Site behavior**  
  Security headers (X-Frame-Options, X-Content-Type-Options, etc.) are set in `netlify.toml` and in Next.js middleware. Copy protection (no right-click context menu, no text selection) is enabled site-wide.

---

## 2. What you must do before deploying

### A. Use PostgreSQL (required)

Netlify cannot use SQLite. Use a hosted Postgres (e.g. Supabase).

1. Go to [supabase.com](https://supabase.com) → Sign in → **New project**.
2. Create the project and wait for the DB to be ready.
3. In the project: **Settings → Database**.
4. Copy the **Connection string** (URI). It looks like:  
   `postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`  
   Replace `[YOUR-PASSWORD]` with the database password you set for the project.

Then in your project:

5. Open **`prisma/schema.prisma`**.
6. Change the datasource to Postgres:
   - Find: `provider = "sqlite"`
   - Replace with: `provider = "postgresql"`
7. Save the file.
8. In your **local** `.env`, set:
   - `DATABASE_URL="<paste the Supabase connection string>"`
9. In the project folder, run:
   ```bash
   npx prisma migrate dev --name init
   ```
   (If you already have migrations, use `npx prisma migrate deploy` or `npx prisma db push` as appropriate.)
10. Run the app locally and confirm login and key flows work with Postgres.

### B. Never commit `.env`

Your `.env` file is in `.gitignore` and `.netlifyignore`. Do not remove it from `.gitignore` and do not commit it. All secrets for production will live only in Netlify.

---

## 3. Create the site on Netlify (CLI)

Do this from your project folder (e.g. `c:\Users\zpuck\Desktop\AJHL`).

1. **Install Netlify CLI** (if needed):
   ```powershell
   npm install -g netlify-cli
   ```

2. **Log in** (browser will open):
   ```powershell
   netlify login
   ```

3. **Create and link the site** (name `ajhl20`):
   ```powershell
   netlify init
   ```
   When prompted:
   - **What would you like to do?** → **Create & configure a new site**
   - **Team** → Choose your team
   - **Site name** → **ajhl20**
   - **Build command** → Accept default (`npm run build` or whatever it suggests)
   - **Directory to deploy** → Accept default (e.g. `.next` or current directory as suggested)

---

## 4. Set environment variables (required)

These are the only place production secrets live. Netlify injects them; they are not in the repo.

1. In the browser go to: **[app.netlify.com](https://app.netlify.com)** → open site **ajhl20**.
2. Go to **Site configuration** (or **Site settings**) → **Environment variables**.
3. Click **Add a variable** / **Add environment variable** and add each of these:

   - **Key:** `DATABASE_URL`  
     **Value:** Your full PostgreSQL connection string (from Supabase).  
     **Scopes:** All (or at least “Production” and “Deploy previews” if you use them).

   - **Key:** `SESSION_SECRET`  
     **Value:** A long random string (e.g. 32+ characters). You can generate one:
     - PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])`
     - Or use any password generator.  
     **Scopes:** All.

   - **Key:** `NODE_ENV`  
     **Value:** `production`  
     **Scopes:** All.  
     (Optional if Netlify already sets it; setting it explicitly doesn’t hurt.)

   - **Key:** `RESEND_API_KEY`  
     **Value:** Leave empty for now (you said email later).  
     **Scopes:** All.

   - **Key:** `EMAIL_FROM`  
     **Value:** Leave empty or a placeholder like `AJHL <noreply@yourdomain.com>`.  
     **Scopes:** All.

4. **Save** the variables.

Important: **Do not** put these values in the repo or in any file that gets committed. Only in Netlify (and in local `.env` for local dev).

---

## 5. Run migrations for production

Your production database (Supabase) needs the schema. Two options.

**Option A – From your machine (easiest):**

1. Temporarily set `DATABASE_URL` to the **same** Supabase URL you put in Netlify (production DB).
2. In the project folder:
   ```powershell
   $env:DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@..."
   npx prisma migrate deploy
   ```
   Use the exact same URL as in Netlify so you’re migrating the production DB.

**Option B – From Netlify build:**

- You can run `npx prisma migrate deploy` in the build command in `netlify.toml`, e.g.:
  `command = "npx prisma migrate deploy && npm run build"`.
- Then every deploy will run migrations first. Only do this if you’re comfortable with migrations running on every deploy.

---

## 6. Deploy

From the same project folder:

```powershell
netlify deploy --prod
```

Follow any prompts. When it finishes, Netlify will show the live URL (e.g. `https://ajhl20.netlify.app`).

---

## 7. Check that secrets are not exposed

- Open your site in a browser.
- **View page source** and **Inspect** (F12) → **Network** / **Sources**.  
  You should **not** see `DATABASE_URL`, `SESSION_SECRET`, or real API keys in HTML or in client-side JS.
- Only server-side code uses those env vars; they are not sent to the browser.

---

## 8. Optional: custom domain and HTTPS

- In Netlify: **Site configuration** → **Domain management** → add your domain and follow the DNS instructions.
- Netlify will provision HTTPS. Your app already uses `secure: true` for cookies when `NODE_ENV === "production"`.

---

## Summary checklist

- [ ] PostgreSQL (e.g. Supabase) created and connection string copied.
- [ ] `prisma/schema.prisma` set to `provider = "postgresql"`.
- [ ] Local `.env` has `DATABASE_URL` and `SESSION_SECRET`; migrations run locally.
- [ ] `netlify login` and `netlify init` (site name: **ajhl20**).
- [ ] Netlify Environment variables set: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`, and optionally `RESEND_API_KEY` / `EMAIL_FROM`.
- [ ] Production DB migrated (`npx prisma migrate deploy` with production `DATABASE_URL`).
- [ ] `netlify deploy --prod` and test the live site.
- [ ] Confirmed no secrets in page source or client JS.

If you tell me which step you’re on (e.g. “I’m at step 4, variables set”), I can give you the next exact command or click path.
