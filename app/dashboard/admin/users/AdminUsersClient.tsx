"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phone: string | null;
  position: string | null;
  jerseyNumber: string | null;
  bio: string | null;
  usaHockey: string | null;
  profilePictureUrl: string | null;
  showContactToTeam: boolean;
  isAdmin: boolean;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function AdminUsersClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    email: "",
    phone: "",
    position: "",
    jerseyNumber: "",
    bio: "",
    usaHockey: "",
    showContactToTeam: true,
  });

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setPagination(data.pagination || null);
      }
    } finally {
      setLoading(false);
    }
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname || "",
      email: user.email,
      phone: user.phone || "",
      position: user.position || "",
      jerseyNumber: user.jerseyNumber || "",
      bio: user.bio || "",
      usaHockey: user.usaHockey || "",
      showContactToTeam: user.showContactToTeam,
    });
  }

  async function saveEdit() {
    if (!editingUser) return;
    setUpdating(editingUser.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProfile",
          userId: editingUser.id,
          ...editForm,
        }),
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update profile.");
      }
    } finally {
      setUpdating(null);
    }
  }

  async function toggleAdmin(userId: string, currentStatus: boolean) {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateAdmin", userId, isAdmin: !currentStatus }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update admin status.");
      }
    } finally {
      setUpdating(null);
    }
  }

  async function resetPassword(userId: string, username: string) {
    if (!confirm(`Reset password for ${username} to "AJHL20"?`)) return;
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetPassword", userId }),
      });
      if (res.ok) {
        alert("Password reset to AJHL20");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to reset password.");
      }
    } finally {
      setUpdating(null);
    }
  }

  const displayName = (u: User) => u.nickname || `${u.firstName} ${u.lastName}`;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email, or username..."
          className="flex-1 min-w-[200px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <span className="text-sm text-zinc-500">
          {pagination ? `${pagination.total} total` : ""}
        </span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-500">Loading...</p>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No users found.</p>
      ) : (
        <>
          <div className="rounded-lg border border-zinc-200">
            <div className="divide-y divide-zinc-200">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900">
                        {displayName(user)}
                      </span>
                      {user.isAdmin && (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Admin
                        </span>
                      )}
                      {user.position && (
                        <span className="text-xs text-zinc-500">({user.position})</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {user.email} ({user.username})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => resetPassword(user.id, user.username)}
                      disabled={updating === user.id}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                    >
                      Reset Password
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAdmin(user.id, user.isAdmin)}
                      disabled={updating === user.id}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                        user.isAdmin
                          ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {updating === user.id
                        ? "…"
                        : user.isAdmin
                          ? "Remove Admin"
                          : "Make Admin"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-600">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900">
              Edit Profile: {displayName(editingUser)}
            </h3>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Nickname (optional)</label>
                <input
                  type="text"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm((f) => ({ ...f, nickname: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Phone (optional)</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Position (optional)</label>
                <select
                  value={editForm.position}
                  onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  <option value="Forward">Forward</option>
                  <option value="Defense">Defense</option>
                  <option value="Goalie">Goalie</option>
                  <option value="LW">LW</option>
                  <option value="RW">RW</option>
                  <option value="Center">Center</option>
                  <option value="LD">LD</option>
                  <option value="RD">RD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Jersey Number (optional)</label>
                <input
                  type="text"
                  value={editForm.jerseyNumber}
                  onChange={(e) => setEditForm((f) => ({ ...f, jerseyNumber: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">USA Hockey (optional)</label>
                <input
                  type="text"
                  value={editForm.usaHockey}
                  onChange={(e) => setEditForm((f) => ({ ...f, usaHockey: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Bio (optional)</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showContact"
                  checked={editForm.showContactToTeam}
                  onChange={(e) => setEditForm((f) => ({ ...f, showContactToTeam: e.target.checked }))}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <label htmlFor="showContact" className="text-sm text-zinc-700">
                  Show contact info to teammates/captains
                </label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={updating === editingUser.id}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updating === editingUser.id ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
