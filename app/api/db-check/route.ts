import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/db-check — Verify the app can reach the database.
 * Open this URL on your live site (e.g. https://ajhl20.netlify.app/api/db-check).
 * Remove or restrict this route in production if you prefer.
 */
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    return NextResponse.json({
      ok: true,
      message: "Database connected",
      counts: { users: userCount, events: eventCount },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, message: "Database error", error: message },
      { status: 500 }
    );
  }
}
