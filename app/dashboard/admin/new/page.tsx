import Link from "next/link";
import { NewEventForm } from "./NewEventForm";
import { LEAGUES, EVENT_TYPES } from "@/lib/events";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin"
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        ← Back to events
      </Link>
      <h2 className="text-lg font-semibold text-zinc-900">New event</h2>
      <NewEventForm leagues={LEAGUES} types={EVENT_TYPES} />
    </div>
  );
}
