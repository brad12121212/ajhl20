import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendWaitlistPromotedEmail } from "@/lib/email";
import { format } from "date-fns";

/** PATCH: admin add user to event, remove user, or reorder waitlist. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id: eventId } = await params;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const isAdmin = session.isAdmin;
    const isCaptain = !isAdmin && await prisma.eventCaptain.findUnique({
      where: { eventId_userId: { eventId, userId: session.userId } },
    });

    const body = await req.json();
    const { action, userId, position, line, assignedPosition } = body;

    if (action === "addCaptain" && userId && isAdmin) {
      await prisma.eventCaptain.upsert({
        where: { eventId_userId: { eventId, userId } },
        create: { eventId, userId },
        update: {},
      });
    } else if (action === "removeCaptain" && userId && isAdmin) {
      await prisma.eventCaptain.deleteMany({
        where: { eventId, userId },
      });
    } else if (action === "approve" && userId) {
      if (!isAdmin && !isCaptain) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      const reg = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId, userId } },
        include: { user: true },
      });
      if (!reg || reg.status !== "requested") {
        return NextResponse.json({ error: "Registration not found or not pending approval." }, { status: 400 });
      }
      // Approved users always go to roster (going)
      await prisma.eventRegistration.update({
        where: { id: reg.id },
        data: { status: "going", position: 0 },
      });
      await logAudit({
        userId: session.userId,
        action: "registration.approve",
        entityType: "registration",
        entityId: reg.id,
        details: JSON.stringify({ eventId, userId: reg.userId, newStatus: "going" }),
      });
      const startTimeStr = format(new Date(event.startTime), "MMM d, yyyy 'at' h:mm a");
      await sendWaitlistPromotedEmail(
        reg.user.email,
        (event as { name?: string }).name || `${event.league} League - ${event.type}`,
        startTimeStr,
        event.location + (event.rink ? ` (${event.rink})` : ""),
        event.venueKey
      );
    } else if (action === "add" && userId) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      // Admin add always puts the player on the roster (going)
      const existing = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (existing) {
        if (existing.status !== "removed") {
          return NextResponse.json({ error: "User already registered." }, { status: 400 });
        }
        await prisma.eventRegistration.update({
          where: { id: existing.id },
          data: { status: "going", position: 0, joinedAt: new Date(), removedAt: null },
        });
      } else {
        await prisma.eventRegistration.create({
          data: { eventId, userId, status: "going", position: 0 },
        });
      }
    } else if (action === "remove" && userId) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      const reg = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId, userId } },
        include: { user: true },
      });
      if (!reg || reg.status === "removed") {
        return NextResponse.json({ error: "Registration not found." }, { status: 400 });
      }
      const wasGoing = reg.status === "going";
      await prisma.eventRegistration.update({
        where: { id: reg.id },
        data: { status: "removed", removedAt: new Date() },
      });
      await logAudit({
        userId: session.userId,
        action: "registration.remove",
        entityType: "registration",
        entityId: reg.id,
        details: JSON.stringify({ eventId, userId: reg.userId }),
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
    } else if (action === "reorder" && Array.isArray(body.waitlistOrder)) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      const order = body.waitlistOrder as string[];
      for (let i = 0; i < order.length; i++) {
        await prisma.eventRegistration.updateMany({
          where: { eventId, userId: order[i], status: "waitlist" },
          data: { position: i },
        });
      }
    } else if (action === "approveAllRequested") {
      if (!isAdmin && !isCaptain) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      const requestedRegs = await prisma.eventRegistration.findMany({
        where: { eventId, status: "requested" },
        orderBy: { joinedAt: "asc" },
        include: { user: true },
      });
      const startTimeStr = format(new Date(event.startTime), "MMM d, yyyy 'at' h:mm a");
      const eventName = event.name || `${event.league} League - ${event.type}`;
      const locationStr = event.location + (event.rink ? ` (${event.rink})` : "");
      for (const reg of requestedRegs) {
        await prisma.eventRegistration.update({
          where: { id: reg.id },
          data: { status: "going", position: 0 },
        });
        await sendWaitlistPromotedEmail(reg.user.email, eventName, startTimeStr, locationStr, event.venueKey);
      }
      if (requestedRegs.length > 0) {
        await logAudit({
          userId: session.userId,
          action: "registration.bulk_approve",
          entityType: "event",
          entityId: eventId,
          details: JSON.stringify({ count: requestedRegs.length }),
        });
      }
    } else if (action === "moveAllWaitlistToGoing") {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      const goingCount = await prisma.eventRegistration.count({ where: { eventId, status: "going" } });
      const maxPlayers = event.maxPlayers ?? 999;
      const spotsLeft = Math.max(0, maxPlayers - goingCount);
      const waitlistRegs = await prisma.eventRegistration.findMany({
        where: { eventId, status: "waitlist" },
        orderBy: { position: "asc" },
        include: { user: true },
      });
      const toMove = waitlistRegs.slice(0, spotsLeft);
      const startTimeStr = format(new Date(event.startTime), "MMM d, yyyy 'at' h:mm a");
      const eventName = event.name || `${event.league} League - ${event.type}`;
      const locationStr = event.location + (event.rink ? ` (${event.rink})` : "");
      for (const reg of toMove) {
        await prisma.eventRegistration.update({
          where: { id: reg.id },
          data: { status: "going", position: 0 },
        });
        await sendWaitlistPromotedEmail(reg.user.email, eventName, startTimeStr, locationStr, event.venueKey);
      }
      if (toMove.length > 0) {
        await logAudit({
          userId: session.userId,
          action: "registration.bulk_waitlist_to_going",
          entityType: "event",
          entityId: eventId,
          details: JSON.stringify({ count: toMove.length }),
        });
      }
    } else if (action === "updateLinePosition" && userId !== undefined) {
      if (!isAdmin && !isCaptain) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      const reg = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!reg || reg.status !== "going") {
        return NextResponse.json({ error: "Registration not found or not on roster." }, { status: 400 });
      }
      await prisma.eventRegistration.update({
        where: { id: reg.id },
        data: {
          line: line !== undefined && line !== null && line >= 1 && line <= 5 ? line : null,
          assignedPosition: assignedPosition !== undefined && assignedPosition !== "" ? assignedPosition : null,
        },
      });
      await logAudit({
        userId: session.userId,
        action: "registration.update_line_position",
        entityType: "registration",
        entityId: reg.id,
        details: JSON.stringify({ eventId, userId, line, assignedPosition }),
      });
    } else {
      return NextResponse.json({ error: "Invalid action or missing params." }, { status: 400 });
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId, status: { in: ["going", "waitlist"] } },
      orderBy: [
        { status: "asc" },
        { line: { sort: "asc", nulls: "last" } },
        { assignedPosition: { sort: "asc", nulls: "last" } },
        { position: "asc" },
        { joinedAt: "asc" },
      ],
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
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}
