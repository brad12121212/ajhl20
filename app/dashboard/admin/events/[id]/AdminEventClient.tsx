"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { RINK_VENUES, type VenueKey } from "@/lib/rinks";
import { getProfilePictureUrl } from "@/lib/profile-picture";

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  email: string;
  position?: string | null;
  profilePictureUrl?: string | null;
};

type Reg = {
  id: string;
  userId: string;
  joinedAt: string;
  position?: number;
  line?: number | null;
  assignedPosition?: string | null;
  user: User;
};

type Event = {
  id: string;
  name: string;
  league: string;
  type: string;
  startTime: string;
  location: string;
  venueKey: string | null;
  rink: string | null;
  description: string | null;
  hasFee: boolean;
  costAmount: number | null;
  maxPlayers: number | null;
  approvalNeeded?: boolean;
  cancelledAt: string | null;
};

type Captain = { id: string; user: User };

type Props = {
  event: Event;
  going: Reg[];
  waitlist: Reg[];
  requested: Reg[];
  captains: Captain[];
  canApprove: boolean;
  isAdmin: boolean;
};

export function AdminEventClient({ event, going, waitlist, requested, captains, canApprove, isAdmin }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addCaptainOpen, setAddCaptainOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [addUserId, setAddUserId] = useState("");
  const [addUserSearch, setAddUserSearch] = useState("");
  const [captainList, setCaptainList] = useState<User[]>([]);
  const [addCaptainId, setAddCaptainId] = useState("");
  const [addCaptainSearch, setAddCaptainSearch] = useState("");
  const [form, setForm] = useState({
    name: event.name,
    startTime: event.startTime.slice(0, 16),
    venueKey: (event.venueKey || "") as VenueKey | "",
    location: event.location,
    rink: event.rink || "",
    description: event.description || "",
    hasFee: event.hasFee,
    costAmount: event.costAmount?.toString() ?? "",
    maxPlayers: event.maxPlayers?.toString() ?? "",
    approvalNeeded: event.approvalNeeded ?? false,
  });
  const [cancelled, setCancelled] = useState(!!event.cancelledAt);
  const [bulkLoading, setBulkLoading] = useState<string | null>(null);

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          startTime: form.startTime,
          venueKey: form.venueKey || null,
          location: form.venueKey ? (RINK_VENUES.find((v) => v.key === form.venueKey)?.name ?? form.location) : form.location,
          rink: form.rink || null,
          description: form.description || null,
          hasFee: form.hasFee,
          costAmount: form.hasFee && form.costAmount ? Number(form.costAmount) : null,
          maxPlayers: form.maxPlayers ? Number(form.maxPlayers) : null,
          approvalNeeded: form.approvalNeeded,
        }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function openAddUser() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json();
    const alreadyIds = new Set([...going, ...waitlist].map((r) => r.userId));
    setUserList(data.users.filter((u: User) => !alreadyIds.has(u.id)));
    setAddUserId("");
    setAddUserSearch("");
    setAddUserOpen(true);
  }

  async function setCancelledState(value: boolean) {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelledAt: value }),
      });
      if (res.ok) {
        setCancelled(value);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function bulkAction(action: "approveAllRequested" | "moveAllWaitlistToGoing") {
    setBulkLoading(action);
    try {
      const res = await fetch(`/api/events/${event.id}/registrations/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBulkLoading(null);
    }
  }

  const displayName = (u: User) =>
    (u.nickname || `${u.firstName} ${u.lastName}`) + (u.position === "Goalie" ? " (Goalie)" : "");
  const addUserFiltered = addUserSearch.trim()
    ? userList.filter((u) => {
        const q = addUserSearch.trim().toLowerCase();
        const name = displayName(u).toLowerCase();
        const full = `${u.firstName} ${u.lastName}`.toLowerCase();
        return name.includes(q) || full.includes(q) || u.username.toLowerCase().includes(q);
      })
    : userList;
  const addUserShow = addUserFiltered.slice(0, 20);

  async function addUser() {
    if (!addUserId) return;
    const res = await fetch(`/api/events/${event.id}/registrations/admin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", userId: addUserId }),
    });
    if (res.ok) {
      setAddUserOpen(false);
      router.refresh();
    }
  }

  async function removeUser(userId: string) {
    if (!confirm("Remove this player from the event?")) return;
    const res = await fetch(`/api/events/${event.id}/registrations/admin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", userId }),
    });
    if (res.ok) router.refresh();
  }

  async function approveUser(userId: string) {
    const res = await fetch(`/api/events/${event.id}/registrations/admin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", userId }),
    });
    if (res.ok) router.refresh();
  }

  async function updateLinePosition(userId: string, line: number | null, assignedPosition: string | null) {
    const res = await fetch(`/api/events/${event.id}/registrations/admin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateLinePosition", userId, line, assignedPosition }),
    });
    if (res.ok) router.refresh();
  }

  async function openAddCaptain() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json();
    const alreadyIds = new Set(captains.map((c) => c.id));
    setCaptainList(data.users.filter((u: User) => !alreadyIds.has(u.id)));
    setAddCaptainId("");
    setAddCaptainSearch("");
    setAddCaptainOpen(true);
  }

  const captainFiltered = addCaptainSearch.trim()
    ? captainList.filter((u) => {
        const q = addCaptainSearch.trim().toLowerCase();
        const name = displayName(u).toLowerCase();
        return name.includes(q) || u.username.toLowerCase().includes(q);
      })
    : captainList;
  const captainShow = captainFiltered.slice(0, 20);

  async function addCaptain() {
    if (!addCaptainId) return;
    const res = await fetch(`/api/events/${event.id}/registrations/admin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addCaptain", userId: addCaptainId }),
    });
    if (res.ok) {
      setAddCaptainOpen(false);
      router.refresh();
    }
  }

  async function removeCaptain(userId: string) {
    const res = await fetch(`/api/events/${event.id}/registrations/admin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "removeCaptain", userId }),
    });
    if (res.ok) router.refresh();
  }

  async function reorderWaitlist(order: string[]) {
    const res = await fetch(`/api/events/${event.id}/registrations/admin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", waitlistOrder: order }),
    });
    if (res.ok) router.refresh();
  }

  async function handleDeleteEvent() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/admin");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete event.");
      }
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {editing ? (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="font-medium text-zinc-900">Edit event</h3>
          <div>
            <label className="block text-xs text-zinc-500">Title</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Start</label>
            <input
              type="datetime-local"
              step="300"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Venue</label>
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
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            >
              <option value="">— Other / custom —</option>
              {RINK_VENUES.map((v) => (
                <option key={v.key} value={v.key}>{v.name}</option>
              ))}
            </select>
          </div>
          {!form.venueKey && (
            <div>
              <label className="block text-xs text-zinc-500">Location (custom)</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-zinc-500">Ice sheet / rink name</label>
            <input
              value={form.rink}
              onChange={(e) => setForm((f) => ({ ...f, rink: e.target.value }))}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              placeholder="e.g. Rink 1, Studio"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.hasFee}
              onChange={(e) => setForm((f) => ({ ...f, hasFee: e.target.checked }))}
              className="h-3 w-3"
            />
            <span className="text-sm">Has fee</span>
          </div>
          {form.hasFee && (
            <div>
              <label className="block text-xs text-zinc-500">Cost ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.costAmount}
                onChange={(e) => setForm((f) => ({ ...f, costAmount: e.target.value }))}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-zinc-500">Max players</label>
            <input
              type="number"
              value={form.maxPlayers}
              onChange={(e) => setForm((f) => ({ ...f, maxPlayers: e.target.value }))}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="approvalNeeded"
              checked={form.approvalNeeded}
              onChange={(e) => setForm((f) => ({ ...f, approvalNeeded: e.target.checked }))}
              className="h-3 w-3"
            />
            <label htmlFor="approvalNeeded" className="text-sm">Approval needed (e.g. substitutes)</label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveEdit}
              disabled={saving}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Edit event details
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={`/api/events/${event.id}/roster/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Export roster (PDF)
        </a>
        {isAdmin && (
          cancelled ? (
            <button
              type="button"
              onClick={() => setCancelledState(false)}
              disabled={saving}
              className="rounded border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              Reinstate event
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCancelledState(true)}
              disabled={saving}
              className="rounded border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Cancel event
            </button>
          )
        )}
        {cancelled && (
          <span className="rounded bg-amber-100 px-2 py-1 text-sm font-medium text-amber-800">
            Event cancelled
          </span>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-700">Roster ({going.length})</h3>
            <button
              type="button"
              onClick={openAddUser}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              + Add player
            </button>
          </div>
          <ul className="mt-2 space-y-2">
            {going.map((r) => (
              <li
                key={r.id}
                className="rounded bg-zinc-50 px-2 py-1.5 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <img
                      src={getProfilePictureUrl(r.user.profilePictureUrl)}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-full border border-zinc-200 object-cover"
                    />
                    <span>
                      {displayName(r.user)}
                      {r.user.position && (isAdmin || canApprove) && (
                        <span className="ml-1.5 text-xs font-medium text-blue-600">
                          ({r.user.position})
                        </span>
                      )}
                    </span>
                    {(r.line || r.assignedPosition) && (
                      <span className="text-xs text-zinc-500">
                        {r.line && `Line ${r.line}`}
                        {r.line && r.assignedPosition && " · "}
                        {r.assignedPosition}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeUser(r.userId)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                {(isAdmin || canApprove) && (
                  <div className="mt-1.5 flex gap-2">
                    <select
                      value={r.line ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                        updateLinePosition(r.userId, val, r.assignedPosition ?? null);
                      }}
                      className="flex-1 rounded border border-zinc-300 px-1.5 py-0.5 text-xs"
                    >
                      <option value="">Line</option>
                      <option value="1">Line 1</option>
                      <option value="2">Line 2</option>
                      <option value="3">Line 3</option>
                      <option value="4">Line 4</option>
                      <option value="5">Line 5</option>
                    </select>
                    <select
                      value={r.assignedPosition ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : e.target.value;
                        updateLinePosition(r.userId, r.line ?? null, val);
                      }}
                      className="flex-1 rounded border border-zinc-300 px-1.5 py-0.5 text-xs"
                    >
                      <option value="">Position</option>
                      <option value="Defense">Defense</option>
                      <option value="Forward">Forward</option>
                      <option value="Goalie">Goalie</option>
                      <option value="LW">LW</option>
                      <option value="RW">RW</option>
                      <option value="Center">Center</option>
                      <option value="LD">LD</option>
                      <option value="RD">RD</option>
                    </select>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-zinc-700">
              Waitlist ({waitlist.length})
              {requested.length > 0 && (
                <span className="font-normal text-amber-700"> · {requested.length} requested to join</span>
              )}
            </h3>
            {isAdmin && waitlist.length > 0 && (
              <button
                type="button"
                onClick={() => bulkAction("moveAllWaitlistToGoing")}
                disabled={!!bulkLoading}
                className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {bulkLoading === "moveAllWaitlistToGoing" ? "…" : "Move all waitlist to going"}
              </button>
            )}
          </div>
          <ul className="mt-2 space-y-1">
            {waitlist.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded bg-zinc-50 px-2 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  {r.user.profilePictureUrl && (
                    <img
                      src={r.user.profilePictureUrl}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-full border border-zinc-200 object-cover"
                    />
                  )}
                  <span>{displayName(r.user)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeUser(r.userId)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {requested.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-medium text-amber-700">Requested to join ({requested.length})</h4>
                {canApprove && (
                  <button
                    type="button"
                    onClick={() => bulkAction("approveAllRequested")}
                    disabled={!!bulkLoading}
                    className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {bulkLoading === "approveAllRequested" ? "…" : "Approve all requested"}
                  </button>
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">Approve to add to roster and send them an email. Listed in order requested.</p>
              <ul className="mt-2 space-y-1">
                {requested.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded bg-amber-50 px-2 py-1.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {r.user.profilePictureUrl && (
                        <img
                          src={r.user.profilePictureUrl}
                          alt=""
                          className="h-6 w-6 shrink-0 rounded-full border border-zinc-200 object-cover"
                        />
                      )}
                      <span>
                        {displayName(r.user)}
                        <span className="ml-2 text-xs font-normal text-zinc-500">
                          requested {format(new Date(r.joinedAt), "MMM d 'at' h:mm a")}
                        </span>
                      </span>
                    </span>
                    <span className="flex gap-2">
                      {canApprove && (
                        <button
                          type="button"
                          onClick={() => approveUser(r.userId)}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Approve
                        </button>
                      )}
                      {canApprove && (
                        <button
                          type="button"
                          onClick={() => removeUser(r.userId)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {addUserOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setAddUserOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-medium text-zinc-900">Add player</h3>
            <p className="mt-1 text-xs text-zinc-500">Type name or username to search</p>
            <input
              type="text"
              value={addUserSearch}
              onChange={(e) => setAddUserSearch(e.target.value)}
              placeholder="Search by name or username…"
              className="mt-2 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              autoFocus
            />
            <ul className="mt-2 max-h-48 overflow-y-auto rounded border border-zinc-200">
              {addUserShow.length === 0 ? (
                <li className="px-3 py-2 text-sm text-zinc-500">
                  {addUserSearch.trim() ? "No matches" : "No players to add"}
                </li>
              ) : (
                addUserShow.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => setAddUserId(u.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 ${
                        addUserId === u.id ? "bg-blue-50 text-blue-800" : ""
                      }`}
                    >
                      {displayName(u)} ({u.username})
                    </button>
                  </li>
                ))
              )}
            </ul>
            {addUserFiltered.length > 20 && (
              <p className="mt-1 text-xs text-zinc-500">
                Showing first 20 of {addUserFiltered.length} — narrow your search
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={addUser}
                disabled={!addUserId}
                className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddUserOpen(false)}
                className="rounded border border-zinc-300 px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {(event.approvalNeeded || captains.length > 0) && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-700">Captains (can approve requests)</h3>
            {isAdmin && (
              <button
                type="button"
                onClick={openAddCaptain}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                + Add captain
              </button>
            )}
          </div>
          {captains.length === 0 ? (
            <p className="mt-2 text-xs text-zinc-500">No captains. Admins can always approve.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {captains.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded bg-zinc-50 px-2 py-1.5 text-sm"
                >
                  <span>{displayName(c.user)}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => removeCaptain(c.id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {addCaptainOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setAddCaptainOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-medium text-zinc-900">Add captain</h3>
            <p className="mt-1 text-xs text-zinc-500">Captains can approve requested sign-ups for this event.</p>
            <input
              type="text"
              value={addCaptainSearch}
              onChange={(e) => setAddCaptainSearch(e.target.value)}
              placeholder="Search by name or username…"
              className="mt-2 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              autoFocus
            />
            <ul className="mt-2 max-h-48 overflow-y-auto rounded border border-zinc-200">
              {captainShow.length === 0 ? (
                <li className="px-3 py-2 text-sm text-zinc-500">
                  {addCaptainSearch.trim() ? "No matches" : "No users to add"}
                </li>
              ) : (
                captainShow.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => setAddCaptainId(u.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 ${
                        addCaptainId === u.id ? "bg-blue-50 text-blue-800" : ""
                      }`}
                    >
                      {displayName(u)} ({u.username})
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={addCaptain}
                disabled={!addCaptainId}
                className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddCaptainOpen(false)}
                className="rounded border border-zinc-300 px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-4">
        <a
          href={`/dashboard/admin/email?eventId=${event.id}`}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Send email to this event’s roster →
        </a>
        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Delete event
        </button>
      </div>

      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && setDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-zinc-900">Delete event?</h3>
            <p className="mt-2 text-sm text-zinc-600">
              This will permanently delete &quot;{event.name}&quot; and all sign-ups. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
