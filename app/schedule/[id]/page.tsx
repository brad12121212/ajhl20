import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isEventActive } from "@/lib/events";
import { format } from "date-fns";
import { EventDetailClient } from "./EventDetailClient";
import { Directions } from "@/components/Directions";
import { getProfilePictureUrl } from "@/lib/profile-picture";

export default async function ScheduleEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

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
              position: true,
              profilePictureUrl: true,
            },
          },
        },
      },
    },
  });

  if (!event) notFound();
  if (!session?.isAdmin && !isEventActive(event.startTime)) notFound();

  const going = event.registrations.filter((r) => r.status === "going");
  const waitlist = event.registrations.filter((r) => r.status === "waitlist");
  const requested = event.registrations.filter((r) => r.status === "requested");
  const myReg = session ? event.registrations.find((r) => r.userId === session.userId) : null;
  const myStatus = myReg?.status ?? null;
  const isCaptain =
    session?.isAdmin ||
    (session
      ? await prisma.eventCaptain.findUnique({
          where: { eventId_userId: { eventId: id, userId: session.userId } },
        }).then(Boolean)
      : false);
  const showRequested = event.approvalNeeded && requested.length > 0 && isCaptain;
  const playerName = (u: { nickname: string | null; firstName: string; lastName: string; position?: string | null }) =>
    (u.nickname || `${u.firstName} ${u.lastName}`) + (u.position === "Goalie" ? " (Goalie)" : "");

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="space-y-6">
        <Link
          href="/schedule"
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← Events
        </Link>
        <div className="rounded-lg border border-zinc-200 border-l-4 border-l-red-400 bg-red-50/30 p-4 sm:p-6">
          {event.cancelledAt && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              This event has been cancelled.
            </div>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900">
                {event.name}
              </h1>
              <p className="mt-1 text-zinc-600">
                {format(new Date(event.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
              <p className="mt-1 text-zinc-600">
                {event.location}
                {event.rink ? ` · ${event.rink}` : ""}
              </p>
              {event.description && (
                <div className="mt-3">
                  <h2 className="text-sm font-medium text-zinc-500">Description</h2>
                  <p className="mt-1 text-sm text-zinc-600 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
              {event.hasFee && (
                <p className="mt-2 text-sm font-medium text-zinc-700">
                  Cost: ${event.costAmount?.toFixed(2) ?? "—"}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-zinc-500">
              {going.length}
              {event.maxPlayers != null && ` / ${event.maxPlayers}`} going
              {event.maxPlayers != null && (
                going.length >= event.maxPlayers ? (
                  <span className="font-medium text-amber-600"> · Full</span>
                ) : (
                  <span> · {event.maxPlayers - going.length} spots left</span>
                )
              )}
              {waitlist.length > 0 && ` · ${waitlist.length} on waitlist`}
              {event.approvalNeeded && requested.length > 0 && ` · ${requested.length} requested to join`}
            </div>
            {!event.cancelledAt && (
              <p className="mt-2">
                <a
                  href={`/api/events/${event.id}/ics`}
                  download
                  className="text-sm text-blue-600 hover:underline"
                >
                  Add to calendar (.ics)
                </a>
              </p>
            )}
          </div>

          <EventDetailClient
            eventId={event.id}
            hasFee={event.hasFee}
            costAmount={event.costAmount ?? undefined}
            maxPlayers={event.maxPlayers ?? undefined}
            goingCount={going.length}
            myStatus={myStatus}
            isActive={isEventActive(event.startTime)}
            isAdmin={session?.isAdmin ?? false}
            isLoggedIn={!!session}
            approvalNeeded={event.approvalNeeded ?? false}
          />
        </div>

        {event.venueKey && <Directions venueKey={event.venueKey} />}

        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-medium text-zinc-500">Roster</h2>
            {going.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-400">No one signed up yet.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {going.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-sm text-zinc-700">
                    <img
                      src={getProfilePictureUrl(r.user.profilePictureUrl)}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-full border border-zinc-200 object-cover"
                    />
                    <span>
                      {playerName(r.user)}
                      {(r.line || r.assignedPosition) && (
                        <span className="ml-2 text-xs text-zinc-500">
                          {r.line && `Line ${r.line}`}
                          {r.line && r.assignedPosition && " · "}
                          {r.assignedPosition}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-medium text-zinc-500">
              Waitlist
              {waitlist.length > 0 && ` (${waitlist.length})`}
              {event.approvalNeeded && requested.length > 0 && ` · ${requested.length} requested to join`}
            </h2>
            {waitlist.length === 0 && (!event.approvalNeeded || requested.length === 0) ? (
              <p className="mt-2 text-sm text-zinc-400">No one on waitlist.</p>
            ) : (
              <div className="mt-2 space-y-4">
                {waitlist.length === 0 ? null : (
                  <ul className="space-y-1">
                    {waitlist.map((r) => (
                      <li key={r.id} className="flex items-center gap-2 text-sm text-zinc-700">
                        {r.user.profilePictureUrl && (
                          <img
                            src={r.user.profilePictureUrl}
                            alt=""
                            className="h-6 w-6 shrink-0 rounded-full border border-zinc-200 object-cover"
                          />
                        )}
                        <span>{playerName(r.user)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {showRequested && requested.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-amber-700">
                      Requested to join ({requested.length}) — pending approval
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">In order requested. Approve from the admin event page.</p>
                    <ul className="mt-1 space-y-1">
                      {requested.map((r) => (
                        <li key={r.id} className="flex items-center gap-2 text-sm text-zinc-700">
                          {r.user.profilePictureUrl && (
                            <img
                              src={r.user.profilePictureUrl}
                              alt=""
                              className="h-6 w-6 shrink-0 rounded-full border border-zinc-200 object-cover"
                            />
                          )}
                          <span>
                            {playerName(r.user)}
                            <span className="ml-2 text-xs text-zinc-500">
                              — {format(new Date(r.joinedAt), "MMM d 'at' h:mm a")}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
