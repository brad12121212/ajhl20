"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword: password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setMessage(data.error || "Failed.");
      }
    } catch {
      setMessage("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-700">Your password has been updated.</p>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-zinc-700">
          Reset code (from email)
        </label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          placeholder="6-digit code"
          maxLength={6}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
          New password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-900">Set new password</h1>
          <p className="mt-1 text-sm text-zinc-500">Enter the code from your email and choose a new password.</p>
        </div>
        <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm text-zinc-500">
          <Link href="/login" className="font-medium text-zinc-900 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
