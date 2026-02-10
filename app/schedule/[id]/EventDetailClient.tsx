"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZELLE_EMAIL } from "@/lib/email";

type Props = {
  eventId: string;
  hasFee: boolean;
  costAmount?: number;
  maxPlayers?: number;
  goingCount: number;
  myStatus: string | null;
  isActive: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  approvalNeeded?: boolean;
};

export function EventDetailClient({
  eventId,
  hasFee,
  costAmount,
  goingCount,
  myStatus,
  isActive,
  isLoggedIn,
  approvalNeeded = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  async function handleJoin() {
    if (!approvalNeeded && hasFee) {
      setShowFeeModal(true);
      return;
    }
    await doJoin();
  }

  async function doJoin() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/registrations`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Failed to join.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
      setShowFeeModal(false);
    }
  }

  async function handleLeave() {
    if (!confirm("Remove yourself from this event?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/registrations`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Failed to leave.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!isActive) {
    return (
      <p className="mt-4 text-sm text-zinc-500">
        This event is no longer open for sign-up.
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mt-6">
        <Link
          href={`/login?redirect=${encodeURIComponent(`/schedule/${eventId}`)}`}
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Log in to sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {myStatus === null && (
        <button
          onClick={handleJoin}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          {loading
            ? approvalNeeded ? "Requesting…" : "Joining…"
            : approvalNeeded ? "Request to join" : "Join Event"}
        </button>
      )}
      {myStatus === "requested" && (
        <>
          <span className="text-sm font-medium text-amber-700">Requested — pending approval</span>
          <button
            onClick={handleLeave}
            disabled={loading}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {loading ? "Cancelling…" : "Cancel request"}
          </button>
        </>
      )}
      {myStatus === "going" && (
        <button
          disabled
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
        >
          Going
        </button>
      )}
      {myStatus === "waitlist" && (
        <button
          disabled
          className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white"
        >
          Waitlisted
        </button>
      )}
      {(myStatus === "going" || myStatus === "waitlist") && (
        <button
          onClick={handleLeave}
          disabled={loading}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {loading ? "Leaving…" : "Remove me"}
        </button>
      )}

      {showFeeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowFeeModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-zinc-900">Payment</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Pay via Zelle to complete your sign-up.
            </p>
            {costAmount != null && (
              <p className="mt-1 text-sm font-medium">Amount: ${costAmount.toFixed(2)}</p>
            )}
            <p className="mt-2 text-sm text-zinc-600">Zelle to:</p>
            <a
              href={`mailto:${ZELLE_EMAIL}`}
              className="mt-1 block break-all font-medium text-blue-600 hover:underline"
            >
              {ZELLE_EMAIL}
            </a>
            <p className="mt-2 text-xs text-zinc-500">
              Include your name and event in the memo.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowFeeModal(false)}
                className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={doJoin}
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "…" : "I've paid — confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
