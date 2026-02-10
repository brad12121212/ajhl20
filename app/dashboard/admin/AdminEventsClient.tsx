"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { LeagueBadge, getLeagueStyles } from "@/components/LeagueBadge";

type EventItem = {
  id: string;
  name: string;
  league: string;
  type: string;
  startTime: Date;
  location: string;
  rink: string | null;
  maxPlayers: number | null;
  registrations: { status: string }[];
};

type Props = {
  activeEvents: EventItem[];
  inactiveEvents: EventItem[];
};

export function AdminEventsClient({ activeEvents, inactiveEvents }: Props) {
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const list = tab === "active" ? activeEvents : inactiveEvents;

  return (
    <div>
      <div className="flex gap-2 border-b border-zinc-200">
        <button
          onClick={() => setTab("active")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            tab === "active"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Active ({activeEvents.length})
        </button>
        <button
          onClick={() => setTab("inactive")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            tab === "inactive"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Past ({inactiveEvents.length})
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {list.length === 0 ? (
          <li className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-10 text-center">
            <p className="text-sm text-zinc-600">No {tab} events yet.</p>
            <p className="mt-1 text-sm text-zinc-500">
              {tab === "active" ? "Create one using the button above." : "Past events will appear here 4 hours after start time."}
            </p>
          </li>
        ) : (
          list.map((event) => {
            const going = event.registrations.filter((r) => r.status === "going").length;
            const waitlist = event.registrations.filter((r) => r.status === "waitlist").length;
            const requested = event.registrations.filter((r) => r.status === "requested").length;
            const hasPending = requested > 0;
            const leagueStyle = getLeagueStyles(event.league);
            return (
              <li key={event.id}>
                <Link
                  href={`/dashboard/admin/events/${event.id}`}
                  className={`block rounded-lg border border-l-4 px-4 py-3 transition ${
                    hasPending
                      ? "border-amber-300 bg-amber-50/50 hover:border-amber-400"
                      : `border-zinc-200 hover:border-zinc-300 ${leagueStyle.border} ${leagueStyle.card}`
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <LeagueBadge league={event.league} />
                    <span className="font-medium text-zinc-900">
                      {event.name || `${event.league} · ${event.type}`}
                    </span>
                    <span className="ml-auto text-sm text-zinc-500">
                      {format(new Date(event.startTime), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-zinc-500">
                      {going}
                      {event.maxPlayers != null && `/${event.maxPlayers}`} going
                      {event.maxPlayers != null && (going >= event.maxPlayers ? (
                        <span className="font-medium text-amber-600"> · Full</span>
                      ) : (
                        <span> · {event.maxPlayers - going} spots left</span>
                      ))}
                      {` · ${waitlist} waitlist`}
                      {requested > 0 && (
                        <span className="font-medium text-amber-700"> · {requested} pending approval</span>
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">
                    {event.location}
                    {event.rink ? ` · ${event.rink}` : ""}
                  </p>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
