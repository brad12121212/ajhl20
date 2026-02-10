import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetCode } from "@/lib/email";

const CODE_EXPIRY_MINUTES = 60;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email?.trim()?.toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const code = generateCode();
    const expires = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetCode: code, passwordResetExpires: expires },
    });
    await sendPasswordResetCode(user.email, code);
  }
  return NextResponse.json({ ok: true, message: "If that email is on file, we sent a reset code." });
}
