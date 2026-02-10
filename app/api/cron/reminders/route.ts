import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEventReminderEmail } from "@/lib/email";
import { format } from "date-fns";

/** GET: send event reminders (call from cron). Events starting in the next 24 hours; users with reminderEvents pref get an email. */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const events = await prisma.event.findMany({
    where: {
      startTime: { gte: now, lte: in24h },
      cancelledAt: null,
    },
    include: {
      registrations: {
        where: { status: { in: ["going", "waitlist"] } },
        include: {
          user: {
            include: {
              emailPrefs: true,
            },
          },
        },
      },
    },
  });

  let sent = 0;
  const startTimeStr = (e: { startTime: Date }) =>
    format(new Date(e.startTime), "MMM d, yyyy 'at' h:mm a");
  const locationStr = (e: { location: string; rink: string | null }) =>
    e.location + (e.rink ? ` (${e.rink})` : "");

  for (const event of events) {
    for (const reg of event.registrations) {
      const prefs = reg.user.emailPrefs;
      if (prefs && !prefs.reminderEvents) continue;
      const result = await sendEventReminderEmail(
        reg.user.email,
        event.name || `${event.league} League - ${event.type}`,
        startTimeStr(event),
        locationStr(event),
        event.venueKey
      );
      if (result.ok) sent++;
    }
  }

  return NextResponse.json({ ok: true, events: events.length, remindersSent: sent });
}
