import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

/** POST: send email to event roster, league, or specific user IDs. */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    const body = await req.json();
    const { subject, body: htmlBody, eventId, league, userIds } = body;
    if (!subject?.trim() || !htmlBody?.trim()) {
      return NextResponse.json({ error: "Subject and body required." }, { status: 400 });
    }

    let emails: string[] = [];
    if (eventId) {
      const regs = await prisma.eventRegistration.findMany({
        where: { eventId, status: "going" },
        include: { user: { select: { email: true } } },
      });
      emails = regs.map((r) => r.user.email);
    } else if (league) {
      const events = await prisma.event.findMany({
        where: { league: String(league).toUpperCase() },
        select: { id: true },
      });
      const regs = await prisma.eventRegistration.findMany({
        where: { eventId: { in: events.map((e) => e.id) }, status: "going" },
        include: { user: { select: { email: true } } },
      });
      emails = [...new Set(regs.map((r) => r.user.email))];
    } else if (Array.isArray(userIds) && userIds.length) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { email: true },
      });
      emails = users.map((u) => u.email);
    } else {
      return NextResponse.json({
        error: "Provide eventId, league, or userIds to select recipients.",
      }, { status: 400 });
    }

    const results: { to: string; ok: boolean; error?: string }[] = [];
    for (const to of emails) {
      const r = await sendEmail(to, subject.trim(), htmlBody.trim());
      results.push({ to, ok: r.ok, error: r.error });
    }
    return NextResponse.json({ sent: results.length, results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send." }, { status: 500 });
  }
}
