import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { AuditLogClient } from "./AuditLogClient";

export default async function AdminAuditPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/dashboard");

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.auditLog.count(),
  ]);

  const userIds = [...new Set(entries.map((e) => e.userId).filter(Boolean))] as string[];
  const users = userIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, firstName: true, lastName: true, nickname: true },
      })
    : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.nickname || `${u.firstName} ${u.lastName}`]));

  const withUser = entries.map((e) => ({
    id: e.id,
    userId: e.userId,
    userName: e.userId ? userMap[e.userId] ?? null : null,
    action: e.action,
    entityType: e.entityType,
    entityId: e.entityId,
    details: e.details,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900">Audit log</h2>
      <p className="text-sm text-zinc-500">
        Who created/edited events, approved or removed players, etc.
      </p>
      <AuditLogClient initialEntries={withUser} total={total} />
    </div>
  );
}
