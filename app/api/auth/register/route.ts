import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, email, firstName, lastName, phone, nickname } = body;
    if (!password || !email?.trim() || !firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: "Password, email, first name, and last name are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    const emailNorm = email.trim().toLowerCase();
    // Username defaults to email for new accounts
    const username = emailNorm;
    const existingByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingByUsername) {
      return NextResponse.json({ error: "An account with this email already exists. Use login or password reset." }, { status: 400 });
    }
    const existingByEmail = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existingByEmail) {
      return NextResponse.json({ error: "An account with this email already exists. Use login or password reset." }, { status: 400 });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username, // Set to email automatically
        passwordHash,
        email: emailNorm,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        nickname: nickname?.trim() || null,
      },
    });
    const token = await createSession({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
    await setSessionCookie(token);
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
