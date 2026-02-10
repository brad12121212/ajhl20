import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { isEventActive, roundToNearest5Minutes } from "@/lib/events";

/** GET: list events. ?active=true (default for non-admin) shows only active; ?active=false for past; admins can see both. */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const activeParam = searchParams.get("active"); // true | false | null (all for admin)

    const now = new Date();
    const events = await prisma.event.findMany({
      orderBy: { startTime: "asc" },
      include: {
        registrations: {
          where: { status: { in: ["going", "waitlist"] } },
          include: { user: { select: { id: true, username: true, firstName: true, lastName: true, nickname: true } } },
        },
      },
    });

    let filtered = events;
    if (!session?.isAdmin) {
      // Non-admins only see active events
      filtered = events.filter((e) => isEventActive(e.startTime));
    } else if (activeParam === "true") {
      filtered = events.filter((e) => isEventActive(e.startTime));
    } else if (activeParam === "false") {
      filtered = events.filter((e) => !isEventActive(e.startTime));
    }

    const withMeta = filtered.map((e) => ({
      ...e,
      isActive: isEventActive(e.startTime),
      goingCount: e.registrations.filter((r) => r.status === "going").length,
      waitlistCount: e.registrations.filter((r) => r.status === "waitlist").length,
    }));

    return NextResponse.json({ events: withMeta });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}

/** POST: create event (admin only) */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    const body = await req.json();
    const {
      name,
      league,
      type,
      startTime,
      location,
      venueKey,
      rink,
      description,
      hasFee,
      costAmount,
      maxPlayers,
      approvalNeeded,
      captainIds,
    } = body;
    if (!name?.trim() || !league || !type || !startTime) {
      return NextResponse.json(
        { error: "Event name, league, type, and startTime are required." },
        { status: 400 }
      );
    }
    const locationStr = location != null && String(location).trim() ? String(location).trim() : "TBD";
    const startDate = new Date(startTime);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid start date or time." },
        { status: 400 }
      );
    }
    const startDateRounded = roundToNearest5Minutes(startDate);
    const costNum = hasFee && costAmount != null ? Number(costAmount) : null;
    const maxNum = maxPlayers != null ? Math.max(0, Number(maxPlayers)) : null;
    const event = await prisma.event.create({
      data: {
        name: String(name).trim(),
        league: String(league).toUpperCase(),
        type: String(type),
        startTime: startDateRounded,
        location: locationStr,
        venueKey: venueKey != null && String(venueKey).trim() ? String(venueKey).trim() : null,
        rink: rink != null ? String(rink).trim() || null : null,
        description: description != null ? String(description) : null,
        hasFee: Boolean(hasFee),
        costAmount: hasFee && costNum != null && !Number.isNaN(costNum) ? costNum : null,
        maxPlayers: maxNum != null && !Number.isNaN(maxNum) ? maxNum : null,
        approvalNeeded: Boolean(approvalNeeded),
      },
    });

    // Create captains if provided
    if (Array.isArray(captainIds) && captainIds.length > 0) {
      const validCaptainIds = captainIds.filter((id) => typeof id === "string" && id.trim());
      if (validCaptainIds.length > 0) {
        await prisma.eventCaptain.createMany({
          data: validCaptainIds.map((userId) => ({
            eventId: event.id,
            userId: userId.trim(),
          })),
          skipDuplicates: true,
        });
      }
    }

    await logAudit({
      userId: session.userId,
      action: "event.create",
      entityType: "event",
      entityId: event.id,
      details: JSON.stringify({
        name: event.name,
        league: event.league,
        startTime: event.startTime.toISOString(),
        captainCount: Array.isArray(captainIds) ? captainIds.length : 0,
      }),
    });
    return NextResponse.json({ event });
  } catch (e) {
    console.error("POST /api/events error:", e);
    const message = e instanceof Error ? e.message : "Failed to create event.";
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Failed to create event." },
      { status: 500 }
    );
  }
}
