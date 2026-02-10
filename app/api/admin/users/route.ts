import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const searchTerm = searchParams.get("search")?.trim() || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 50;
  const skip = (page - 1) * pageSize;

  // SQLite doesn't support case-insensitive mode, so we'll filter in memory for small datasets
  // or use LIKE which is case-insensitive for ASCII in SQLite
  const where = searchTerm
    ? {
        OR: [
          { firstName: { contains: searchTerm } },
          { lastName: { contains: searchTerm } },
          { nickname: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { username: { contains: searchTerm } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ isAdmin: "desc" }, { username: "asc" }],
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        nickname: true,
        phone: true,
        position: true,
        jerseyNumber: true,
        bio: true,
        usaHockey: true,
        profilePictureUrl: true,
        showContactToTeam: true,
        isAdmin: true,
      },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

/** PATCH: update user admin status, profile, or reset password */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { userId, action, ...data } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (action === "updateAdmin") {
      if (typeof data.isAdmin !== "boolean") {
        return NextResponse.json({ error: "isAdmin (boolean) required." }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: userId },
        data: { isAdmin: data.isAdmin },
      });
      await logAudit({
        userId: session.userId,
        action: "user.update_admin",
        entityType: "user",
        entityId: userId,
        details: JSON.stringify({ userId, isAdmin: data.isAdmin, targetUsername: user.username }),
      });
    } else if (action === "resetPassword") {
      const passwordHash = await hashPassword("AJHL20");
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      await logAudit({
        userId: session.userId,
        action: "user.reset_password",
        entityType: "user",
        entityId: userId,
        details: JSON.stringify({ userId, targetUsername: user.username }),
      });
    } else if (action === "updateProfile") {
      const update: {
        firstName?: string;
        lastName?: string;
        nickname?: string | null;
        email?: string;
        phone?: string | null;
        position?: string | null;
        jerseyNumber?: string | null;
        bio?: string | null;
        usaHockey?: string | null;
        profilePictureUrl?: string | null;
        showContactToTeam?: boolean;
      } = {};

      if (data.firstName !== undefined) update.firstName = data.firstName?.trim() || "";
      if (data.lastName !== undefined) update.lastName = data.lastName?.trim() || "";
      if (data.nickname !== undefined) update.nickname = data.nickname?.trim() || null;
      if (data.phone !== undefined) update.phone = data.phone?.trim() || null;
      if (data.position !== undefined) update.position = data.position?.trim() || null;
      if (data.jerseyNumber !== undefined) update.jerseyNumber = data.jerseyNumber?.trim() || null;
      if (data.bio !== undefined) update.bio = data.bio?.trim() || null;
      if (data.usaHockey !== undefined) update.usaHockey = data.usaHockey?.trim() || null;
      if (data.profilePictureUrl !== undefined) update.profilePictureUrl = data.profilePictureUrl?.trim() || null;
      if (data.showContactToTeam !== undefined) update.showContactToTeam = Boolean(data.showContactToTeam);

      if (data.email !== undefined) {
        const emailNorm = data.email?.trim().toLowerCase();
        if (!emailNorm) {
          return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }
        const existing = await prisma.user.findFirst({
          where: { email: emailNorm, id: { not: userId } },
        });
        if (existing) {
          return NextResponse.json({ error: "That email is already in use by another account." }, { status: 400 });
        }
        update.email = emailNorm;
      }

      await prisma.user.update({
        where: { id: userId },
        data: update,
      });
      await logAudit({
        userId: session.userId,
        action: "user.update_profile",
        entityType: "user",
        entityId: userId,
        details: JSON.stringify({ userId, targetUsername: user.username, fields: Object.keys(update) }),
      });
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}
