import Link from "next/link";
import { prisma } from "@/lib/db";
import { isEventActive } from "@/lib/events";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { CalendarNav } from "./CalendarNav";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) - 1 : now.getMonth();
  const date = new Date(year, month, 1);
  if (Number.isNaN(date.getTime())) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Link href="/schedule" className="text-sm text-zinc-500 hover:text-zinc-700">← Events</Link>
        <p className="mt-4 text-zinc-500">Invalid month.</p>
      </div>
    );
  }

  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });

  const events = await prisma.event.findMany({
    where: {
      startTime: { gte: start, lte: new Date(end.getTime() + 24 * 60 * 60 * 1000) },
      cancelledAt: null,
    },
    orderBy: { startTime: "asc" },
    include: {
      registrations: { where: { status: "going" } },
    },
  });

  const prevMonth = subMonths(date, 1);
  const nextMonth = addMonths(date, 1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/schedule" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Events
        </Link>
        <CalendarNav
          month={month}
          year={year}
          prevUrl={`/schedule/calendar?year=${prevMonth.getFullYear()}&month=${prevMonth.getMonth() + 1}`}
          nextUrl={`/schedule/calendar?year=${nextMonth.getFullYear()}&month=${nextMonth.getMonth() + 1}`}
        />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900">
        {format(date, "MMMM yyyy")}
      </h1>

      <div className="mt-6 grid grid-cols-7 gap-px rounded-lg border border-zinc-200 bg-zinc-200 overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-zinc-100 px-2 py-2 text-center text-xs font-medium text-zinc-600">
            {d}
          </div>
        ))}
        {Array.from({ length: start.getDay() }, (_, i) => (
          <div key={`pad-${i}`} className="min-h-[80px] bg-white" />
        ))}
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), day));
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] bg-white p-1 ${!isSameMonth(day, date) ? "opacity-50" : ""}`}
            >
              <p className="text-xs font-medium text-zinc-600">{format(day, "d")}</p>
              <ul className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/schedule/${e.id}`}
                      className="block truncate rounded bg-red-50 px-1 py-0.5 text-xs text-red-800 hover:bg-red-100"
                      title={e.name}
                    >
                      {format(new Date(e.startTime), "h:mm a")} {e.name}
                    </Link>
                  </li>
                ))}
                {dayEvents.length > 3 && (
                  <li className="text-xs text-zinc-500 px-1">+{dayEvents.length - 3} more</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
