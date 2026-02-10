import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const prefs = await prisma.emailPreferences.findUnique({
    where: { userId: session.userId },
  });
  return NextResponse.json({
    reminderEvents: prefs?.reminderEvents ?? true,
    reminderWaitlistMoved: prefs?.reminderWaitlistMoved ?? true,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await req.json();
  const { reminderEvents, reminderWaitlistMoved } = body;
  const prefs = await prisma.emailPreferences.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      reminderEvents: reminderEvents ?? true,
      reminderWaitlistMoved: reminderWaitlistMoved ?? true,
    },
    update: {
      ...(reminderEvents !== undefined && { reminderEvents }),
      ...(reminderWaitlistMoved !== undefined && { reminderWaitlistMoved }),
    },
  });
  return NextResponse.json({
    reminderEvents: prefs.reminderEvents,
    reminderWaitlistMoved: prefs.reminderWaitlistMoved,
  });
}
