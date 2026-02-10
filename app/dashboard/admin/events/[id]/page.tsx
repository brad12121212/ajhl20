import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { AdminEventClient } from "./AdminEventClient";

export default async function AdminEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.isAdmin) notFound();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        where: { status: { in: ["going", "waitlist", "requested"] } },
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
              position: true,
              profilePictureUrl: true,
            },
          },
        },
      },
      captains: {
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
      },
    },
  });

  if (!event) notFound();

  const going = event.registrations.filter((r) => r.status === "going");
  const waitlist = event.registrations.filter((r) => r.status === "waitlist");
  const requested = event.registrations.filter((r) => r.status === "requested");
  const captains = event.captains.map((c) => ({ id: c.userId, user: c.user }));
  const isCaptain = session.isAdmin
    ? true
    : await prisma.eventCaptain.findUnique({
        where: { eventId_userId: { eventId: id, userId: session.userId } },
      }).then(Boolean);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin"
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        ← Back to events
      </Link>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          {event.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          {event.league} League · {event.type} — {format(new Date(event.startTime), "MMM d, yyyy 'at' h:mm a")} — {event.location}
          {event.rink ? ` · ${event.rink}` : ""}
        </p>
        <AdminEventClient
          event={{
            id: event.id,
            name: event.name,
            startTime: event.startTime.toISOString(),
            location: event.location,
            venueKey: event.venueKey,
            rink: event.rink,
            description: event.description,
            hasFee: event.hasFee,
            costAmount: event.costAmount,
            maxPlayers: event.maxPlayers,
            league: event.league,
            type: event.type,
            approvalNeeded: event.approvalNeeded,
            cancelledAt: event.cancelledAt?.toISOString() ?? null,
          }}
          going={going.map((r) => ({
            id: r.id,
            userId: r.user.id,
            joinedAt: r.joinedAt.toISOString(),
            line: r.line ?? null,
            assignedPosition: r.assignedPosition ?? null,
            user: r.user,
          }))}
          waitlist={waitlist.map((r) => ({
            id: r.id,
            userId: r.user.id,
            position: r.position,
            joinedAt: r.joinedAt.toISOString(),
            user: r.user,
          }))}
          requested={requested.map((r) => ({
            id: r.id,
            userId: r.user.id,
            joinedAt: r.joinedAt.toISOString(),
            user: r.user,
          }))}
          captains={captains}
          canApprove={session.isAdmin || isCaptain}
          isAdmin={session.isAdmin}
        />
      </div>
    </div>
  );
}
