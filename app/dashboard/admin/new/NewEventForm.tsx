"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RINK_VENUES, type VenueKey } from "@/lib/rinks";

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
};

type Props = {
  leagues: readonly string[];
  types: readonly string[];
};

export function NewEventForm({ leagues, types }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userList, setUserList] = useState<User[]>([]);
  const [captainIds, setCaptainIds] = useState<string[]>([]);
  const [captainSearch, setCaptainSearch] = useState("");
  const [showCaptainSelect, setShowCaptainSelect] = useState(false);
  const [form, setForm] = useState({
    name: "",
    league: "A",
    type: "extra",
    startTime: "",
    venueKey: "" as VenueKey | "",
    location: "",
    rink: "",
    description: "",
    hasFee: false,
    costAmount: "",
    maxPlayers: "",
    approvalNeeded: false,
  });

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUserList(data.users || []);
      }
    }
    fetchUsers();
  }, []);

  const displayName = (u: User) => u.nickname || `${u.firstName} ${u.lastName}`;
  const captainFiltered = captainSearch.trim()
    ? userList.filter((u) => {
        const q = captainSearch.trim().toLowerCase();
        const name = displayName(u).toLowerCase();
        return name.includes(q) || u.username.toLowerCase().includes(q);
      })
    : userList;
  const captainShow = captainFiltered.slice(0, 20);

  function addCaptain(userId: string) {
    if (!captainIds.includes(userId)) {
      setCaptainIds([...captainIds, userId]);
      setCaptainSearch("");
    }
  }

  function removeCaptain(userId: string) {
    setCaptainIds(captainIds.filter((id) => id !== userId));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          league: form.league,
          type: form.type,
          startTime: form.startTime || undefined,
          venueKey: form.venueKey || undefined,
          location: form.venueKey ? RINK_VENUES.find((v) => v.key === form.venueKey)?.name ?? form.location : form.location,
          rink: form.rink || undefined,
          description: form.description || undefined,
          hasFee: form.hasFee,
          costAmount: form.hasFee && form.costAmount ? Number(form.costAmount) : undefined,
          maxPlayers: form.maxPlayers ? Number(form.maxPlayers) : undefined,
          approvalNeeded: form.approvalNeeded,
          captainIds: captainIds.length > 0 ? captainIds : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error || "Failed to create event.");
        return;
      }
      router.push(`/dashboard/admin/events/${data.event.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-700">Title</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          placeholder="e.g. Friday 10v10, Pickup Skate"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">League</label>
          <select
            value={form.league}
            onChange={(e) => setForm((f) => ({ ...f, league: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          >
            {leagues.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          >
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Start date & time</label>
        <input
          type="datetime-local"
          step="300"
          value={form.startTime}
          onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Venue</label>
        <select
          value={form.venueKey}
          onChange={(e) => {
            const key = e.target.value as VenueKey | "";
            const venue = key ? RINK_VENUES.find((v) => v.key === key) : null;
            setForm((f) => ({
              ...f,
              venueKey: key,
              location: venue ? venue.name : f.location,
            }));
          }}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
        >
          <option value="">— Other / custom —</option>
          {RINK_VENUES.map((v) => (
            <option key={v.key} value={v.key}>{v.name}</option>
          ))}
        </select>
      </div>
      {!form.venueKey && (
        <div>
          <label className="block text-sm font-medium text-zinc-700">Location (when not using a preset venue)</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
            placeholder="e.g. Pompano Beach, FL"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-700">Ice sheet / rink name (optional)</label>
        <input
          type="text"
          value={form.rink}
          onChange={(e) => setForm((f) => ({ ...f, rink: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          placeholder="e.g. Rink 1, Studio, Main"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Description (optional)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          rows={2}
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="hasFee"
          checked={form.hasFee}
          onChange={(e) => setForm((f) => ({ ...f, hasFee: e.target.checked }))}
          className="h-4 w-4 rounded border-zinc-300"
        />
        <label htmlFor="hasFee" className="text-sm text-zinc-700">Event has a fee</label>
      </div>
      {form.hasFee && (
        <div>
          <label className="block text-sm font-medium text-zinc-700">Cost ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.costAmount}
            onChange={(e) => setForm((f) => ({ ...f, costAmount: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-700">Max players (optional)</label>
        <input
          type="number"
          min="0"
          value={form.maxPlayers}
          onChange={(e) => setForm((f) => ({ ...f, maxPlayers: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          placeholder="Leave empty for no limit"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="approvalNeeded"
          checked={form.approvalNeeded}
          onChange={(e) => setForm((f) => ({ ...f, approvalNeeded: e.target.checked }))}
          className="h-4 w-4 rounded border-zinc-300"
        />
        <label htmlFor="approvalNeeded" className="text-sm text-zinc-700">Approval needed (e.g. substitutes — they request to join, you approve)</label>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-700">Captains (optional)</label>
          <button
            type="button"
            onClick={() => setShowCaptainSelect(!showCaptainSelect)}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            {showCaptainSelect ? "Hide" : "+ Add captain"}
          </button>
        </div>
        {captainIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {captainIds.map((userId) => {
              const user = userList.find((u) => u.id === userId);
              if (!user) return null;
              return (
                <span
                  key={userId}
                  className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"
                >
                  {displayName(user)}
                  <button
                    type="button"
                    onClick={() => removeCaptain(userId)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
        {showCaptainSelect && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={captainSearch}
              onChange={(e) => setCaptainSearch(e.target.value)}
              placeholder="Search for a player..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            />
            <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-200">
              {captainShow.length === 0 ? (
                <p className="px-3 py-2 text-sm text-zinc-500">No users found.</p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {captainShow
                    .filter((u) => !captainIds.includes(u.id))
                    .map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => addCaptain(u.id)}
                          className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          {displayName(u)} ({u.username})
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create event"}
        </button>
        <Link
          href="/dashboard/admin"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
