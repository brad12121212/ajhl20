"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  userEmail: string;
};

export function ProfilePasswordClient({ userEmail }: Props) {
  const router = useRouter();
  const [changing, setChanging] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [message, setMessage] = useState("");
  const [changeForm, setChangeForm] = useState({ current: "", new: "" });
  const [resetForm, setResetForm] = useState({ code: "", newPassword: "" });

  async function changePassword() {
    if (!changeForm.current || !changeForm.new) {
      setMessage("Enter current and new password.");
      return;
    }
    if (changeForm.new.length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }
    setChanging(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: changeForm.current,
          newPassword: changeForm.new,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated.");
        setChangeForm({ current: "", new: "" });
      } else {
        setMessage(data.error || "Failed.");
      }
    } finally {
      setChanging(false);
    }
  }

  async function sendResetCode() {
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSent(true);
        setResetMode(true);
        setMessage("Check your email for the reset code.");
      } else {
        setMessage(data.error || "Failed to send code.");
      }
    } catch {
      setMessage("Request failed.");
    }
  }

  async function submitReset() {
    if (!resetForm.code.trim() || !resetForm.newPassword) {
      setMessage("Enter the code and new password.");
      return;
    }
    if (resetForm.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }
    setChanging(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          code: resetForm.code.trim(),
          newPassword: resetForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated. You can close this.");
        setResetForm({ code: "", newPassword: "" });
        setResetMode(false);
        setResetSent(false);
        router.refresh();
      } else {
        setMessage(data.error || "Failed.");
      }
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      <h2 className="text-sm font-medium text-zinc-900">Password</h2>

      {!resetMode ? (
        <>
          <p className="mt-1 text-xs text-zinc-500">Change password (you must know your current password).</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs text-zinc-500">Current password</label>
              <input
                type="password"
                value={changeForm.current}
                onChange={(e) => setChangeForm((f) => ({ ...f, current: e.target.value }))}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500">New password</label>
              <input
                type="password"
                value={changeForm.new}
                onChange={(e) => setChangeForm((f) => ({ ...f, new: e.target.value }))}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={changePassword}
                disabled={changing}
                className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {changing ? "Updating…" : "Change password"}
              </button>
              <button
                type="button"
                onClick={sendResetCode}
                className="text-sm text-zinc-600 underline hover:text-zinc-900"
              >
                Forgot password? Email me a reset code
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-xs text-zinc-500">
            We sent a code to your email. Enter it below with your new password.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs text-zinc-500">Reset code</label>
              <input
                type="text"
                value={resetForm.code}
                onChange={(e) => setResetForm((f) => ({ ...f, code: e.target.value }))}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                placeholder="6-digit code"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500">New password</label>
              <input
                type="password"
                value={resetForm.newPassword}
                onChange={(e) => setResetForm((f) => ({ ...f, newPassword: e.target.value }))}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={submitReset}
                disabled={changing}
                className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {changing ? "Updating…" : "Set new password"}
              </button>
              <button
                type="button"
                onClick={() => { setResetMode(false); setMessage(""); }}
                className="text-sm text-zinc-600 underline hover:text-zinc-900"
              >
                Back
              </button>
            </div>
          </div>
        </>
      )}
      {message && <p className="mt-2 text-sm text-zinc-600">{message}</p>}
    </div>
  );
}
