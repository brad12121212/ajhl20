# Quick Deploy Guide - AJHL 2.0 to Netlify

## 🚀 Step-by-Step Deployment

### Step 1: Set Up PostgreSQL Database (REQUIRED)

**SQLite won't work on Netlify!** You need a hosted database.

**Recommended: Supabase (Free)**
1. Go to https://supabase.com → Sign up → New Project
2. Wait for database to be created (~2 minutes)
3. Go to **Settings → Database**
4. Copy the **Connection string** (URI format)
   - It looks like: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - Replace `[PASSWORD]` with your database password

### Step 2: Update Prisma Schema

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 3: Test Database Locally

1. Update your `.env` file with the PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```

2. Run migrations locally:
   ```powershell
   npx prisma migrate dev --name init
   ```
   This creates migration files in `prisma/migrations/`

3. Test that everything works:
   ```powershell
   npm run dev
   ```

### Step 4: Deploy to Netlify

1. **Install Netlify CLI** (if needed):
   ```powershell
   npm install -g netlify-cli
   ```

2. **Login**:
   ```powershell
   netlify login
   ```

3. **Initialize site** (from project directory):
   ```powershell
   netlify init
   ```
   - Choose: **Create & configure a new site**
   - Site name: **ajhl20**
   - Build command: `npm run build` (should auto-detect)
   - Publish directory: `.next` (should auto-detect)

4. **Set Environment Variables**:
   ```powershell
   netlify env:set DATABASE_URL "your-postgresql-connection-string"
   netlify env:set SESSION_SECRET "any-random-secret-string-here"
   netlify env:set RESEND_API_KEY ""
   netlify env:set EMAIL_FROM ""
   ```
   
   Or set them in Netlify Dashboard:
   - Go to: Site settings → Environment variables
   - Add each variable

5. **Run Migrations on Production**:
   ```powershell
   # Temporarily point to production DB
   $env:DATABASE_URL="your-production-postgresql-url"
   npx prisma migrate deploy
   ```

6. **Deploy**:
   ```powershell
   netlify deploy --prod
   ```

### Step 5: Verify

1. Visit your site: `https://ajhl20.netlify.app` (or your custom domain)
2. Test login/registration
3. Check Netlify logs if anything fails

## ⚠️ Important Notes

- **File uploads won't work** on Netlify (profile pictures, news images) - they need cloud storage
- **Email is disabled** (RESEND_API_KEY is empty) - as requested
- **Phone verification** is not implemented - as requested
- **First admin user**: You'll need to create this manually via database or seed script

## 🆘 Troubleshooting

**Build fails?**
- Check Netlify build logs
- Ensure DATABASE_URL is set correctly
- Make sure migrations ran successfully

**Database connection errors?**
- Verify PostgreSQL connection string is correct
- Check if database allows connections from Netlify IPs (Supabase does by default)
- Ensure migrations have been run

**Site works but can't login?**
- Check SESSION_SECRET is set
- Verify database has users table

## 📝 What's Configured

✅ `netlify.toml` - Netlify configuration
✅ Build scripts - Prisma generation included
✅ Environment variables - Structure ready
✅ `.netlifyignore` - Excludes unnecessary files

## 🔄 Future Updates

After initial deployment, you can:
- Connect GitHub repo for auto-deploy
- Set up custom domain
- Add file storage (Cloudinary/S3) for uploads
- Configure email service (Resend) when ready
