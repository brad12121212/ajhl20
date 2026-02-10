import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, code, newPassword } = body;
  const emailNorm = email?.trim()?.toLowerCase();
  if (!emailNorm || !code?.trim() || !newPassword) {
    return NextResponse.json({ error: "Email, reset code, and new password are required." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: emailNorm },
    select: { id: true, passwordResetCode: true, passwordResetExpires: true },
  });
  if (!user || user.passwordResetCode !== code.trim()) {
    return NextResponse.json({ error: "Invalid or expired reset code." }, { status: 400 });
  }
  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    return NextResponse.json({ error: "Reset code has expired. Request a new one." }, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetCode: null, passwordResetExpires: null },
  });
  return NextResponse.json({ ok: true });
}
