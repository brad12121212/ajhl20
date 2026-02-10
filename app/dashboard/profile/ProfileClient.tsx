"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  reminderEvents: boolean;
  reminderWaitlistMoved: boolean;
};

export function ProfileClient({ reminderEvents, reminderWaitlistMoved }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState(reminderEvents);
  const [waitlist, setWaitlist] = useState(reminderWaitlistMoved);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEvents(reminderEvents);
    setWaitlist(reminderWaitlistMoved);
  }, [reminderEvents, reminderWaitlistMoved]);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/users/email-prefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderEvents: events,
          reminderWaitlistMoved: waitlist,
        }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      <h2 className="text-sm font-medium text-zinc-900">Email reminders</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Choose when you want to receive emails.
      </p>
      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={events}
            onChange={(e) => setEvents(e.target.checked)}
            onBlur={save}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-700">Remind me about events I'm signed up for</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={waitlist}
            onChange={(e) => setWaitlist(e.target.checked)}
            onBlur={save}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-700">Email when I'm moved from waitlist to roster</span>
        </label>
      </div>
      {loading && <p className="mt-2 text-xs text-zinc-400">Saving…</p>}
    </div>
  );
}
