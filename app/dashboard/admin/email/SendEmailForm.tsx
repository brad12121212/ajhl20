"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Props = { leagues: readonly string[] };

function SendEmailFormInner({ leagues }: Props) {
  const searchParams = useSearchParams();
  const presetEventId = searchParams.get("eventId");

  const [eventId, setEventId] = useState(presetEventId || "");
  const [league, setLeague] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [events, setEvents] = useState<{ id: string; league: string; type: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (presetEventId) setEventId(presetEventId);
  }, [presetEventId]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body: body.replace(/\n/g, "<br>"),
          ...(eventId ? { eventId } : league ? { league } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`Sent to ${data.sent} recipient(s).`);
        setSubject("");
        setBody("");
      } else {
        setResult(data.error || "Failed to send.");
      }
    } finally {
      setLoading(false);
    }
  }

  const canSend = (eventId || league) && subject.trim() && body.trim();

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
      <p className="text-sm text-zinc-500">
        Send to: event roster, or everyone in a league.
      </p>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Event (optional)</label>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
        >
          <option value="">— Select event —</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.league} · {ev.type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Or league (optional)</label>
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
        >
          <option value="">— Select league —</option>
          {leagues.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          rows={5}
          required
        />
      </div>
      {result && (
        <p className={`text-sm ${result.startsWith("Sent") ? "text-green-700" : "text-red-600"}`}>
          {result}
        </p>
      )}
      <button
        type="submit"
        disabled={!canSend || loading}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send email"}
      </button>
    </form>
  );
}

export function SendEmailForm(props: Props) {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
      <SendEmailFormInner {...props} />
    </Suspense>
  );
}
