# Supabase Storage (picture uploads)

Profile pictures and news post images are stored in **Supabase Storage** so uploads work on Netlify (the server filesystem is not persistent there).

## 1. Create storage buckets

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Storage** in the sidebar.
3. Click **New bucket** and create two buckets:
   - **Name:** `profiles` — **Public bucket:** ON (so profile picture URLs work).
   - **Name:** `news` — **Public bucket:** ON (so news images load).

Leave RLS policies as default if you only use the service role from the server; the server uploads with the service role key and does not use RLS for these buckets.

## 2. Get your project URL and service role key

1. In the same project, go to **Settings** → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`).
   - **service_role** key (under "Project API keys"). Keep this secret; it bypasses Row Level Security.

## 3. Set environment variables

**Local (`.env`):**

```env
SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Netlify:**

1. Site → **Site configuration** → **Environment variables**.
2. Add:
   - `SUPABASE_URL` = your Project URL.
   - `SUPABASE_SERVICE_ROLE_KEY` = your service_role key.
3. Trigger a new deploy after saving.

## 4. Allowed formats and limits

- **Types:** JPEG, PNG, GIF, WebP.
- **Max file size:** 5MB per file.

If the env vars are missing, the upload endpoints return a 503 with instructions to configure Supabase Storage.
