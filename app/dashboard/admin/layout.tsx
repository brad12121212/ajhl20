import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-zinc-900">Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard/admin" className="text-zinc-600 hover:text-zinc-900">
            Events
          </Link>
          <Link href="/dashboard/admin/news" className="text-zinc-600 hover:text-zinc-900">
            News feed
          </Link>
          <Link href="/dashboard/admin/email" className="text-zinc-600 hover:text-zinc-900">
            Send email
          </Link>
          <Link href="/dashboard/admin/reports" className="text-zinc-600 hover:text-zinc-900">
            Reports
          </Link>
          <Link href="/dashboard/admin/audit" className="text-zinc-600 hover:text-zinc-900">
            Audit log
          </Link>
          <Link href="/dashboard/admin/users" className="text-zinc-600 hover:text-zinc-900">
            Accounts
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
