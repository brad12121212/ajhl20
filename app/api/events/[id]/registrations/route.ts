import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isEventActive } from "@/lib/events";
import { sendWaitlistPromotedEmail } from "@/lib/email";
import { format } from "date-fns";

/** GET: list registrations for event (going + waitlist) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!session.isAdmin && !isEventActive(event.startTime)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId: id, status: { in: ["going", "waitlist"] } },
    orderBy: [{ status: "asc" }, { position: "asc" }, { joinedAt: "asc" }],
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          nickname: true,
          email: true,
        },
      },
    },
  });
  return NextResponse.json({ registrations });
}

/** POST: join event (current user). Body: none. Puts on roster or waitlist by space. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id: eventId } = await params;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!isEventActive(event.startTime)) {
      return NextResponse.json({ error: "Event is no longer open for sign-up." }, { status: 400 });
    }
    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId: session.userId } },
    });
    if (existing && existing.status !== "removed") {
      return NextResponse.json({ error: "Already registered for this event." }, { status: 400 });
    }

    const approvalNeeded = (event as { approvalNeeded?: boolean }).approvalNeeded === true;
    let status: string;
    let position = 0;
    if (approvalNeeded) {
      status = "requested";
    } else {
      const goingCount = await prisma.eventRegistration.count({
        where: { eventId, status: "going" },
      });
      const maxPlayers = event.maxPlayers ?? 999;
      status = goingCount < maxPlayers ? "going" : "waitlist";
      const waitlistCount = await prisma.eventRegistration.count({
        where: { eventId, status: "waitlist" },
      });
      position = status === "waitlist" ? waitlistCount : 0;
    }

    if (existing?.status === "removed") {
      await prisma.eventRegistration.update({
        where: { id: existing.id },
        data: { status, position, joinedAt: new Date(), removedAt: null },
      });
    } else {
      await prisma.eventRegistration.create({
        data: { eventId, userId: session.userId, status, position },
      });
    }
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId, status: { in: ["going", "waitlist", "requested"] } },
      orderBy: [{ status: "asc" }, { position: "asc" }, { joinedAt: "asc" }],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            nickname: true,
          },
        },
      },
    });
    return NextResponse.json({
      registrations,
      myStatus: status,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to join." }, { status: 500 });
  }
}

/** DELETE: leave event. If was "going", promote first waitlist and send email. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id: eventId } = await params;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const reg = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId: session.userId } },
    });
    if (!reg || reg.status === "removed") {
      return NextResponse.json({ error: "Not registered for this event." }, { status: 400 });
    }
    const wasRequested = reg.status === "requested";
    const wasGoing = reg.status === "going";
    await prisma.eventRegistration.update({
      where: { id: reg.id },
      data: { status: "removed", removedAt: new Date() },
    });

    if (wasGoing && event.maxPlayers != null) {
      const firstWaitlist = await prisma.eventRegistration.findFirst({
        where: { eventId, status: "waitlist" },
        orderBy: { position: "asc" },
        include: { user: true },
      });
      if (firstWaitlist) {
        await prisma.eventRegistration.update({
          where: { id: firstWaitlist.id },
          data: { status: "going", position: 0 },
        });
        const startTimeStr = format(new Date(event.startTime), "MMM d, yyyy 'at' h:mm a");
        await sendWaitlistPromotedEmail(
          firstWaitlist.user.email,
          (event as { name?: string }).name || `${event.league} League - ${event.type}`,
          startTimeStr,
          event.location + (event.rink ? ` (${event.rink})` : ""),
          event.venueKey
        );
      }
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId, status: { in: ["going", "waitlist", "requested"] } },
      orderBy: [{ status: "asc" }, { position: "asc" }, { joinedAt: "asc" }],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            nickname: true,
          },
        },
      },
    });
    return NextResponse.json({ registrations });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to leave." }, { status: 500 });
  }
}
