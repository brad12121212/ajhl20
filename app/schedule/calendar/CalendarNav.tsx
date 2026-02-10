"use client";

import Link from "next/link";

type Props = {
  month: number;
  year: number;
  prevUrl: string;
  nextUrl: string;
};

export function CalendarNav({ prevUrl, nextUrl }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={prevUrl}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        ← Previous
      </Link>
      <Link
        href={nextUrl}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Next →
      </Link>
    </div>
  );
}
