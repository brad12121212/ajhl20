import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isEventActive } from "@/lib/events";
import { format } from "date-fns";
import { LeagueBadge, getLeagueStyles } from "@/components/LeagueBadge";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const myRegs = await prisma.eventRegistration.findMany({
    where: {
      userId: session.userId,
      status: { in: ["going", "waitlist", "requested"] },
    },
    include: {
      event: {
        include: {
          registrations: {
            where: { status: { in: ["going", "waitlist", "requested"] } },
          },
        },
      },
    },
  });

  const events = myRegs.map((r) => ({ ...r.event, myStatus: r.status }));
  const active = events.filter((e) => isEventActive(e.startTime));

  const byLeague = ["A", "B", "C", "D"].map((league) => ({
    league,
    leagueEvents: active.filter((e) => e.league === league),
  }));

  return (
    <div className="space-y-8">
      {session.isAdmin && (
        <div className="rounded-lg border-2 border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Admin panel</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Create new events, manage rosters and waitlists, and send emails to players.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create & manage events
            </Link>
            <Link
              href="/dashboard/admin/email"
              className="inline-flex items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Send email
            </Link>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-zinc-900">My schedule</h1>
        <Link
          href="/schedule"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all events →
        </Link>
      </div>
      {active.length === 0 ? (
        <p className="text-zinc-500">
          You’re not signed up for any events.{" "}
          <Link href="/schedule" className="text-blue-600 hover:underline">Browse events</Link> to join.
        </p>
      ) : (
        <div className="space-y-8">
          {byLeague.map(
            ({ league, leagueEvents }) =>
              leagueEvents.length > 0 && (
                <section key={league}>
                  <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
                    {league} League
                  </h2>
                  <div className="space-y-2">
                    {["league", "extra"].map((type) => {
                      const list = leagueEvents.filter((e) => e.type === type);
                      return list.length > 0 ? (
                        <div key={type} className="space-y-1">
                          <h3 className="text-xs font-medium uppercase text-zinc-400">
                            {type}
                          </h3>
                          <ul className="space-y-1">
                            {list.map((event) => {
                              const going = event.registrations.filter(
                                (r) => r.status === "going"
                              ).length;
                              const waitlist = event.registrations.filter(
                                (r) => r.status === "waitlist"
                              ).length;
                              const requested = event.registrations.filter(
                                (r) => r.status === "requested"
                              ).length;
                              const max = event.maxPlayers ?? null;
                              const leagueStyle = getLeagueStyles(event.league);
                              return (
                                <li key={event.id}>
                                  <Link
                                    href={`/schedule/${event.id}`}
                                    className={`block rounded-lg border border-zinc-200 border-l-4 px-4 py-3 transition hover:border-zinc-300 ${leagueStyle.border} ${leagueStyle.card}`}
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <LeagueBadge league={event.league} />
                                      <span className="font-medium text-zinc-900">
                                        {event.name || `${event.league} · ${event.type}`}
                                      </span>
                                      <span className="ml-auto text-sm text-zinc-500">
                                        {format(
                                          new Date(event.startTime),
                                          "EEE, MMM d"
                                        )}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-500">
                                      {event.location}
                                      {event.rink ? ` · ${event.rink}` : ""}
                                    </p>
                                    <p className="mt-0.5 text-sm text-zinc-400">
                                      {(event as { myStatus?: string }).myStatus === "requested" && (
                                        <span className="font-medium text-amber-600">Requested · </span>
                                      )}
                                      {going}
                                      {max != null && `/${max}`} going
                                      {max != null && (going >= max ? (
                                        <span className="font-medium text-amber-600"> · Full</span>
                                      ) : (
                                        <span> · {max - going} spots left</span>
                                      ))}
                                      {waitlist > 0 && ` · ${waitlist} waitlist`}
                                      {event.approvalNeeded && requested > 0 && (
                                        <span className="font-medium text-amber-600"> · {requested} requested</span>
                                      )}
                                    </p>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null;
                    })}
                  </div>
                </section>
              )
          )}
        </div>
      )}
    </div>
  );
}
