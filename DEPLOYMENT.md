# Deployment Guide for AJHL 2.0

## ⚠️ IMPORTANT: Before Deploying

### 1. **Database Setup** (REQUIRED - SQLite won't work on Netlify)

**You MUST switch to PostgreSQL before deploying.** SQLite uses local files which don't persist on Netlify's serverless functions.

**Recommended: Supabase (Free tier)**
1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)
5. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
6. Update your local `.env` with the PostgreSQL connection string
7. Run locally to test: `npx prisma migrate dev --name init` (or `npx prisma db push`)
8. This will create migration files in `prisma/migrations/`

**Other Options:**
- **Neon** (Free tier): https://neon.tech
- **Railway** (Free tier): https://railway.app

### 2. **Netlify CLI Setup & Deployment**

1. **Install Netlify CLI** (if not already installed):
   ```powershell
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```powershell
   netlify login
   ```
   This will open your browser to authenticate.

3. **Initialize the site** (from your project directory):
   ```powershell
   netlify init
   ```
   When prompted:
   - **Create & configure a new site**
   - **Site name**: `ajhl20`
   - **Team**: Select your team
   - **Build command**: `npm run build` (should auto-detect)
   - **Directory to deploy**: `.next` (should auto-detect)

4. **Set Environment Variables** in Netlify:
   - Go to https://app.netlify.com → Your site → Site settings → Environment variables
   - Or use CLI:
     ```powershell
     netlify env:set DATABASE_URL "your-postgresql-connection-string"
     netlify env:set SESSION_SECRET "generate-a-random-secret-here"
     netlify env:set RESEND_API_KEY ""
     netlify env:set EMAIL_FROM ""
     ```
   - **Generate SESSION_SECRET**: Run `openssl rand -base64 32` or use any random string generator

5. **Run Database Migrations** (IMPORTANT - before first deploy):
   
   **Option A: Run migrations locally pointing to production DB** (easiest):
   ```powershell
   # Temporarily set DATABASE_URL to your production PostgreSQL URL
   $env:DATABASE_URL="your-production-postgresql-url"
   npx prisma migrate deploy
   ```
   
   **Option B: Create a Netlify Build Hook**:
   - Go to Site settings → Build & deploy → Build hooks
   - Create a hook that runs: `npx prisma migrate deploy && npm run build`
   
   **Option C: Run via Netlify Functions** (more complex, requires custom function)

6. **Deploy**:
   ```powershell
   netlify deploy --prod
   ```

### 3. **Update Prisma Schema for PostgreSQL**

Before deploying, update `prisma/schema.prisma`:
- Change `provider = "sqlite"` to `provider = "postgresql"`
- Run `npx prisma migrate dev --name init` locally first to create migrations
- Then run `npx prisma migrate deploy` on Netlify (or use `npx prisma db push`)

### 4. **File Uploads** (Optional - for profile pictures and news images)

Netlify doesn't support persistent file storage. Options:
- **Cloudinary** (Free tier): https://cloudinary.com
- **AWS S3** (Pay as you go)
- **Uploadcare** (Free tier): https://uploadcare.com

For now, file uploads will work locally but won't persist on Netlify.

## What's Already Configured

✅ Netlify configuration (`netlify.toml`)
✅ Build scripts with Prisma generation (`postinstall` hook)
✅ Email system (disabled when RESEND_API_KEY is empty)
✅ Environment variable structure

## Quick Deployment Checklist

- [ ] Set up PostgreSQL database (Supabase/Neon/Railway)
- [ ] Update `prisma/schema.prisma` to use `postgresql` provider
- [ ] Test database connection locally with new PostgreSQL URL
- [ ] Run `npx prisma migrate dev` locally to create migrations
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Login: `netlify login`
- [ ] Initialize: `netlify init` (name: `ajhl20`)
- [ ] Set environment variables in Netlify dashboard
- [ ] Deploy: `netlify deploy --prod`
- [ ] Run migrations on production (via Netlify Functions or build hook)

## After Deployment

1. **Test the site**: Visit your Netlify URL (e.g., `https://ajhl20.netlify.app`)
2. **Create first admin user**: You'll need to do this via database or add a seed script
3. **Monitor logs**: Use `netlify logs:functions` or check Netlify dashboard

## Notes

- ✅ Email functionality is disabled (RESEND_API_KEY empty)
- ✅ Phone verification is not implemented (as requested)
- ⚠️ File uploads won't work until cloud storage is configured
- ⚠️ SQLite must be replaced with PostgreSQL before deployment
