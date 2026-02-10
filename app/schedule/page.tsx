import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isEventActive } from "@/lib/events";
import { EventCard } from "./EventCard";

export default async function SchedulePage() {
  const session = await getSession();
  const events = await prisma.event.findMany({
    orderBy: { startTime: "asc" },
    include: {
      registrations: {
        where: { status: { in: ["going", "waitlist", "requested"] } },
      },
    },
  });

  const active = events.filter((e) => isEventActive(e.startTime) && !e.cancelledAt);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-zinc-900">Events</h1>
        <Link
          href="/schedule/calendar"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Calendar view
        </Link>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        View events and sign up when logged in.
      </p>
      {active.length === 0 ? (
        <p className="mt-8 text-zinc-500">No upcoming events.</p>
      ) : (
        <ul className="mt-8 space-y-1">
          {active.map((event) => {
            const going = event.registrations.filter(
              (r) => r.status === "going"
            ).length;
            const waitlist = event.registrations.filter(
              (r) => r.status === "waitlist"
            ).length;
            const max = event.maxPlayers ?? null;
            const myReg = session
              ? event.registrations.find((r) => r.userId === session.userId)
              : null;
            const myStatus = myReg?.status ?? null;
            return (
              <li key={event.id}>
                <EventCard
                  event={{
                    id: event.id,
                    name: event.name,
                    league: event.league,
                    type: event.type,
                    description: event.description,
                    location: event.location,
                    rink: event.rink,
                    startTime: event.startTime,
                  }}
                  going={going}
                  waitlist={waitlist}
                  max={max}
                  myStatus={myStatus}
                  borderClass="border-l-red-400"
                  cardClass="bg-red-50/30"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
