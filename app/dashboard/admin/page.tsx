import Link from "next/link";
import { prisma } from "@/lib/db";
import { isEventActive } from "@/lib/events";
import { format } from "date-fns";
import { AdminEventsClient } from "./AdminEventsClient";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startTime: "desc" },
    include: {
      registrations: {
        where: { status: { in: ["going", "waitlist", "requested"] } },
      },
    },
  });

  const active = events.filter((e) => isEventActive(e.startTime));
  const inactive = events.filter((e) => !isEventActive(e.startTime));
  const pendingCount = events.reduce(
    (sum, e) => sum + e.registrations.filter((r) => r.status === "requested").length,
    0
  );
  const eventsWithPending = active.filter(
    (e) => e.registrations.some((r) => r.status === "requested")
  );

  return (
    <div className="space-y-8">
      {pendingCount > 0 && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <h2 className="text-base font-semibold text-amber-900">
            {pendingCount} pending approval{pendingCount !== 1 ? "s" : ""}
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            {eventsWithPending.length} event{eventsWithPending.length !== 1 ? "s" : ""} have
            people waiting to be approved. Open an event below to approve or remove.
          </p>
        </div>
      )}
      <div className="rounded-lg border-2 border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Create event</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Add a new event (league, date/time, location, fee, max players, waitlist).
        </p>
        <Link
          href="/dashboard/admin/new"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New event
        </Link>
      </div>
      <div>
        <h2 className="mb-3 text-base font-semibold text-zinc-900">Manage events</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Click an event to edit details, add/remove players, or reorder the waitlist.
        </p>
        <AdminEventsClient activeEvents={active} inactiveEvents={inactive} />
      </div>
    </div>
  );
}
