# Deploy AJHL to Netlify via Git

Builds run on Netlify’s servers (Linux), so you avoid Windows symlink issues and the 250 MB function limit is easier to meet.

---

## Step 1: Push your code to GitHub

**If the project is not in Git yet:**

```powershell
cd C:\Users\zpuck\Desktop\AJHL
git init
git add .
git commit -m "Initial commit"
```

**Create a new repo on GitHub:**

1. Go to **https://github.com/new**
2. Repository name: **ajhl20** (or any name)
3. Leave it empty (no README, .gitignore, or license)
4. Click **Create repository**

**Connect and push:**

```powershell
git remote add origin https://github.com/YOUR_USERNAME/ajhl20.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Use the repo URL GitHub shows (HTTPS or SSH).

**If you already have a Git repo** with a remote, just push:

```powershell
git push -u origin main
```

---

## Step 2: Connect GitHub to Netlify

**Option A – You already have site “ajhl20” on Netlify**

1. Go to **https://app.netlify.com**
2. Open site **ajhl20**
3. Go to **Site configuration** (or **Site settings**) → **Build & deploy** → **Continuous deployment**
4. Click **Link repository** or **Manage repository**
5. Choose **GitHub**, authorize if asked, then select the **ajhl20** repo (and branch **main**)
6. Netlify will use your **netlify.toml** (build: `npm run build:netlify`, publish: `.next`) — no need to change unless you want to
7. Click **Save**

**Option B – Create a new site from the repo**

1. Go to **https://app.netlify.com**
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub**, authorize if asked
4. Select the **ajhl20** repository
5. Branch: **main**
6. Build command and publish directory will be read from **netlify.toml** (`npm run build:netlify`, `.next`) — leave as is
7. **Do not** click Deploy yet — add env vars first (Step 3), then deploy

---

## Step 3: Set environment variables (required)

1. In your Netlify site: **Site configuration** → **Environment variables** → **Add a variable** or **Add environment variables**
2. Add these (same values as in your local `.env`):

| Variable          | Value                                      | Scopes  |
|-------------------|--------------------------------------------|---------|
| `DATABASE_URL`    | Your Supabase PostgreSQL connection string | All     |
| `SESSION_SECRET` | A long random string (16+ characters)      | All     |
| `NODE_ENV`        | `production`                               | All     |

3. **Save** or **Deploy** (if you just linked the repo, trigger a deploy after saving).

**Important:** Use the same `DATABASE_URL` and `SESSION_SECRET` as in your local `.env` so the live site uses the same database and auth.

---

## Step 4: Deploy

- **If you linked an existing site:** Go to **Deploys** → **Trigger deploy** → **Deploy site** (or push a new commit to `main`).
- **If you created a new site:** Click **Deploy site** after adding the env vars.

The first build may take a few minutes. When it finishes, the site URL will be shown (e.g. **https://ajhl20.netlify.app** or a random name until you set it).

---

## Step 5: Set site name to ajhl20 (if needed)

If the URL is not yet **https://ajhl20.netlify.app**:

1. **Site configuration** → **Domain management** → **Options**
2. **Edit site name** → set to **ajhl20** → **Save**

---

## After this

- **To deploy again:** Push to **main** (e.g. `git push origin main`). Netlify will build and deploy automatically.
- **Build command** is always `npm run build:netlify` from **netlify.toml** (Prisma generate, migrate, Next build, then prune for a smaller function).
- **Secrets** stay in Netlify’s environment variables; do not commit `.env` to Git.
