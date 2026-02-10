import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current password and new password are required." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash },
  });
  return NextResponse.json({ ok: true });
}
