"use client";

import { format } from "date-fns";

type Entry = {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
};

type Props = {
  initialEntries: Entry[];
  total: number;
};

export function AuditLogClient({ initialEntries, total }: Props) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
      <p className="px-4 py-2 text-xs text-zinc-500 border-b border-zinc-200">
        Showing {initialEntries.length} of {total} entries
      </p>
      <ul className="divide-y divide-zinc-100">
        {initialEntries.map((e) => (
          <li key={e.id} className="px-4 py-2 text-sm">
            <span className="text-zinc-500">{format(new Date(e.createdAt), "MMM d, h:mm a")}</span>
            {" · "}
            <span className="font-medium text-zinc-700">{e.action}</span>
            {e.userName && <span className="text-zinc-600"> by {e.userName}</span>}
            {e.entityType && e.entityId && (
              <span className="text-zinc-500"> ({e.entityType} {e.entityId.slice(0, 8)}…)</span>
            )}
            {e.details && (
              <span className="block mt-0.5 text-xs text-zinc-400 truncate max-w-2xl" title={e.details}>
                {e.details}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
