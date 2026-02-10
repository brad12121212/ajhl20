"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Props = {
  event: {
    id: string;
    name: string | null;
    league: string;
    type: string;
    description: string | null;
    location: string;
    rink: string | null;
    startTime: Date | string;
  };
  going: number;
  waitlist: number;
  max: number | null;
  myStatus: string | null;
  borderClass: string;
  cardClass: string;
};

export function EventCard({ event, going, waitlist, max, myStatus, borderClass, cardClass }: Props) {
  const router = useRouter();
  const isFull = max != null && going >= max;
  const eventHref = `/schedule/${event.id}`;
  const startTime = typeof event.startTime === "string" ? event.startTime : event.startTime;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(eventHref)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(eventHref);
        }
      }}
      className={`block cursor-pointer rounded-lg border border-zinc-200 border-l-4 px-3 py-2.5 transition hover:border-zinc-300 ${
        isFull ? "border-l-zinc-400 bg-zinc-50" : `${borderClass} ${cardClass}`
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-zinc-900">
          {event.name || "Event"}
        </span>
        <span className="ml-auto text-sm text-zinc-500">
          {format(new Date(startTime), "EEE, MMM d · h:mm a")}
        </span>
      </div>
      {event.description && (
        <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600">{event.description}</p>
      )}

      <div className="mt-1.5 flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm text-zinc-600">
          {event.location}
          {event.rink ? ` · ${event.rink}` : ""}
        </p>
        <div className="flex flex-shrink-0 flex-col items-end gap-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-end gap-0.5">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm font-medium text-zinc-700">
              {max != null ? `${going}/${max}` : going} going
            </span>
            {(isFull || waitlist > 0) && (
              <span className="text-xs text-zinc-500">
                {isFull && "Full"}
                {isFull && waitlist > 0 && " · "}
                {waitlist > 0 && `${waitlist} waitlist`}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {myStatus === "going" ? (
              <span className="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white">
                Going
              </span>
            ) : myStatus === "waitlist" ? (
              <span className="rounded-lg bg-yellow-500 px-2.5 py-1.5 text-xs font-medium text-white">
                Waitlisted
              </span>
            ) : isFull ? (
              <Link
                href={eventHref}
                className="rounded-lg border-2 border-blue-500 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                Join Waitlist
              </Link>
            ) : (
              <Link
                href={eventHref}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500"
              >
                Join Event
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
