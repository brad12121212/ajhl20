import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabase, isSupabaseStorageConfigured } from "@/lib/supabase";

/**
 * GET /api/db-check — Verify the app can reach the database and (if configured) Storage buckets.
 * Open this URL on your live site (e.g. https://ajhl20.netlify.app/api/db-check).
 * Remove or restrict this route in production if you prefer.
 */
export async function GET() {
  const result: {
    ok: boolean;
    message: string;
    database?: { users: number; events: number; profilesWithPicture: number };
    storage?: { configured: boolean; profiles: string; news: string };
    error?: string;
  } = {
    ok: true,
    message: "OK",
  };

  try {
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    const profilesWithPicture = await prisma.user.count({
      where: { profilePictureUrl: { not: null } },
    });
    result.database = {
      users: userCount,
      events: eventCount,
      profilesWithPicture,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    result.ok = false;
    result.message = "Database error";
    result.error = message;
    return NextResponse.json(result, { status: 500 });
  }

  if (isSupabaseStorageConfigured()) {
    result.storage = { configured: true, profiles: "unknown", news: "unknown" };
    try {
      const supabase = getSupabase();
      const [profilesRes, newsRes] = await Promise.all([
        supabase.storage.from("profiles").list("", { limit: 1 }),
        supabase.storage.from("news").list("", { limit: 1 }),
      ]);
      result.storage.profiles = profilesRes.error ? `error: ${profilesRes.error.message}` : "ok";
      result.storage.news = newsRes.error ? `error: ${newsRes.error.message}` : "ok";
      if (profilesRes.error || newsRes.error) result.ok = false;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      result.storage.profiles = "error";
      result.storage.news = "error";
      result.storage.configured = true;
      result.error = (result.error ? result.error + "; " : "") + `Storage: ${message}`;
      result.ok = false;
    }
  } else {
    result.storage = {
      configured: false,
      profiles: "not configured",
      news: "not configured",
    };
  }

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
