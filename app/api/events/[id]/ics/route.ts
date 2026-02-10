import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET: return .ics file for this event (add to calendar) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
  });
  if (!event || event.cancelledAt) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const start = new Date(event.startTime);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default
  const formatICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AJHL2.0//EN",
    "BEGIN:VEVENT",
    "UID:" + event.id + "@ajhl",
    "DTSTAMP:" + formatICSDate(new Date()),
    "DTSTART:" + formatICSDate(start),
    "DTEND:" + formatICSDate(end),
    "SUMMARY:" + escape(event.name),
    "DESCRIPTION:" + escape([event.location, event.rink, event.description].filter(Boolean).join("\\n")),
    "LOCATION:" + escape(event.location + (event.rink ? `, ${event.rink}` : "")),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="event-${event.id}.ics"`,
    },
  });
}
