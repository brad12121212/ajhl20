import Link from "next/link";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session?.isAdmin) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin"
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        ← Back to admin
      </Link>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Accounts</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Search, view, and manage member accounts. Edit profiles, grant admin access, or reset passwords.
        </p>
        <AdminUsersClient />
      </div>
    </div>
  );
}
