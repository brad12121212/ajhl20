import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

/** GET: list audit log entries (admin only). ?limit=100&offset=0 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10) || 100));
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
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

  return NextResponse.json({ entries: withUser, total });
}
