import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Admin</h1>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
