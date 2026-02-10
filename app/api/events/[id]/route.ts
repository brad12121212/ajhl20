import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { isEventActive, roundToNearest5Minutes } from "@/lib/events";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          where: { status: { in: ["going", "waitlist", "requested"] } },
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
                phone: true,
                showContactToTeam: true,
              },
            },
          },
        },
      },
    });
    if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (event.cancelledAt) {
      // Return event but caller should show as cancelled
    }
    if (!session?.isAdmin && !isEventActive(event.startTime)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const going = event.registrations.filter((r) => r.status === "going");
    const waitlist = event.registrations.filter((r) => r.status === "waitlist");
    const requested = event.registrations.filter((r) => r.status === "requested");
    const myReg = session ? event.registrations.find((r) => r.userId === session.userId) : null;
    return NextResponse.json({
      event: {
        ...event,
        isActive: isEventActive(event.startTime),
        going,
        waitlist,
        requested,
        myStatus: myReg?.status ?? null,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch event." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    const { id } = await params;
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
      cancelledAt,
    } = body;
    const data: Record<string, unknown> = {};
    if (name != null) data.name = String(name).trim();
    if (league != null) data.league = String(league).toUpperCase();
    if (type != null) data.type = String(type);
    if (startTime != null) data.startTime = roundToNearest5Minutes(new Date(startTime));
    if (location != null) data.location = String(location);
    if (venueKey !== undefined) data.venueKey = venueKey == null || String(venueKey).trim() === "" ? null : String(venueKey).trim();
    if (rink !== undefined) data.rink = rink == null ? null : String(rink);
    if (description !== undefined) data.description = description == null ? null : String(description);
    if (hasFee !== undefined) data.hasFee = Boolean(hasFee);
    if (hasFee && costAmount != null) data.costAmount = Number(costAmount);
    else if (!hasFee) data.costAmount = null;
    if (maxPlayers !== undefined) data.maxPlayers = maxPlayers == null ? null : Math.max(0, Number(maxPlayers));
    if (approvalNeeded !== undefined) data.approvalNeeded = Boolean(approvalNeeded);
    if (cancelledAt !== undefined) data.cancelledAt = cancelledAt === true || cancelledAt === "true" ? new Date() : null;
    const event = await prisma.event.update({
      where: { id },
      data: data as Parameters<typeof prisma.event.update>[0]["data"],
    });
    if (cancelledAt === true || cancelledAt === "true") {
      await logAudit({
        userId: session.userId,
        action: "event.cancel",
        entityType: "event",
        entityId: id,
        details: JSON.stringify({ name: event.name }),
      });
    } else if (startTime != null || name != null || league != null || type != null || location != null) {
      await logAudit({
        userId: session.userId,
        action: startTime != null ? "event.reschedule" : "event.update",
        entityType: "event",
        entityId: id,
        details: JSON.stringify({ name: event.name, startTime: event.startTime.toISOString() }),
      });
    }
    return NextResponse.json({ event });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }
}
