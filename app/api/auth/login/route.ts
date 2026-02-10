import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body; // Accepts email or username for backward compatibility
    if (!username?.trim() || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }
    const identifier = username.trim().toLowerCase();
    // Try email first (new accounts), then username (existing accounts)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
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
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
