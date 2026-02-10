import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { format } from "date-fns";

export default async function AdminReportsPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/dashboard");

  const events = await prisma.event.findMany({
    orderBy: { startTime: "desc" },
    include: {
      registrations: {
        where: { status: { in: ["going", "waitlist", "requested"] } },
      },
    },
  });

  const totalEvents = events.length;
  const cancelledCount = events.filter((e) => e.cancelledAt).length;
  const activeEvents = events.filter((e) => !e.cancelledAt && e.startTime > new Date());
  const pastEvents = events.filter((e) => e.startTime <= new Date());

  const byLeague = ["A", "B", "C", "D"].map((league) => ({
    league,
    count: events.filter((e) => e.league === league).length,
  }));

  const totalGoing = events.reduce((s, e) => s + e.registrations.filter((r) => r.status === "going").length, 0);
  const totalWaitlist = events.reduce((s, e) => s + e.registrations.filter((r) => r.status === "waitlist").length, 0);
  const totalRequested = events.reduce((s, e) => s + e.registrations.filter((r) => r.status === "requested").length, 0);

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-zinc-900">Reports</h2>
      <p className="text-sm text-zinc-500">
        Event counts and signup summary.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-2xl font-semibold text-zinc-900">{totalEvents}</p>
          <p className="text-sm text-zinc-500">Total events</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-2xl font-semibold text-zinc-900">{activeEvents.length}</p>
          <p className="text-sm text-zinc-500">Upcoming (not cancelled)</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-2xl font-semibold text-zinc-900">{pastEvents.length}</p>
          <p className="text-sm text-zinc-500">Past events</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-2xl font-semibold text-amber-600">{cancelledCount}</p>
          <p className="text-sm text-zinc-500">Cancelled</p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-zinc-800">Signups summary</h3>
        <ul className="mt-2 space-y-1 text-sm text-zinc-600">
          <li>Total &quot;going&quot; registrations (across all events): {totalGoing}</li>
          <li>Total on waitlist: {totalWaitlist}</li>
          <li>Total requested (pending approval): {totalRequested}</li>
        </ul>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-zinc-800">Events by league</h3>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="py-2">League</th>
              <th className="py-2">Event count</th>
            </tr>
          </thead>
          <tbody>
            {byLeague.map(({ league, count }) => (
              <tr key={league} className="border-b border-zinc-100">
                <td className="py-2 font-medium">{league}</td>
                <td className="py-2">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-zinc-800">Recent events (last 20)</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {events.slice(0, 20).map((e) => {
            const going = e.registrations.filter((r) => r.status === "going").length;
            const waitlist = e.registrations.filter((r) => r.status === "waitlist").length;
            const requested = e.registrations.filter((r) => r.status === "requested").length;
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-x-2 gap-y-0">
                <span className={e.cancelledAt ? "text-zinc-400 line-through" : "text-zinc-800"}>
                  {e.name}
                </span>
                <span className="text-zinc-500">
                  {format(new Date(e.startTime), "MMM d, yyyy")}
                </span>
                <span className="text-zinc-500">
                  {going}
                  {e.maxPlayers != null && `/${e.maxPlayers}`} going
                  {waitlist > 0 && ` · ${waitlist} waitlist`}
                  {requested > 0 && ` · ${requested} requested`}
                </span>
                {e.cancelledAt && <span className="text-amber-600 text-xs">Cancelled</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
