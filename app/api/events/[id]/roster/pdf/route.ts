import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { PDFDocument, StandardFonts, rgb, RGB } from "pdf-lib";
import path from "path";
import fs from "fs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id: eventId } = await params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        where: { status: { in: ["going", "waitlist"] } },
        orderBy: [
          { status: "asc" },
          { line: { sort: "asc", nulls: "last" } },
          { assignedPosition: { sort: "asc", nulls: "last" } },
          { position: "asc" },
          { joinedAt: "asc" },
        ],
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              nickname: true,
              email: true,
              phone: true,
              showContactToTeam: true,
              jerseyNumber: true,
              position: true,
            },
          },
        },
      },
    },
  });

  if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const isAdmin = session.isAdmin;
  const isCaptain = !isAdmin && await prisma.eventCaptain.findUnique({
    where: { eventId_userId: { eventId, userId: session.userId } },
  });
  if (!isAdmin && !isCaptain) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const going = event.registrations.filter((r) => r.status === "going");
  const waitlist = event.registrations.filter((r) => r.status === "waitlist");

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 612;
  const pageHeight = 792;
  let currentPage = doc.addPage([pageWidth, pageHeight]);
  const margin = 50;
  let y = pageHeight - margin;
  const lineHeight = 14;
  const smallLine = 10;
  const dark: RGB = rgb(0.15, 0.15, 0.15);
  const muted: RGB = rgb(0.35, 0.35, 0.35);

  function drawText(
    text: string,
    x: number,
    size: number,
    bold = false,
    color: RGB = dark
  ) {
    const f = bold ? fontBold : font;
    currentPage.drawText(text, { x, y, size, font: f, color });
    y -= size + 2;
  }

  function drawTextLine(text: string, x: number, size: number, bold = false, color: RGB = dark) {
    const f = bold ? fontBold : font;
    currentPage.drawText(text, { x, y, size, font: f, color });
    y -= lineHeight;
  }

  // Logo at top center (2x size: 240pt wide max, 72pt tall max)
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await doc.embedPng(logoBytes);
      const logoScale = Math.min(240 / logoImage.width, 72 / logoImage.height, 1);
      const logoW = logoImage.width * logoScale;
      const logoH = logoImage.height * logoScale;
      const logoX = (pageWidth - logoW) / 2;
      currentPage.drawImage(logoImage, {
        x: logoX,
        y: y - logoH,
        width: logoW,
        height: logoH,
      });
      y -= logoH + 16;
    } catch {
      // if logo fails, continue without it
    }
  }

  // Event name centered
  const eventName = event.name || `${event.league} League — ${event.type}`;
  const nameWidth = fontBold.widthOfTextAtSize(eventName, 18);
  currentPage.drawText(eventName, {
    x: (pageWidth - nameWidth) / 2,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0.7, 0.1, 0.1),
  });
  y -= 22;

  // Date/time and location
  drawTextLine(
    format(new Date(event.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a"),
    margin,
    smallLine,
    false,
    muted
  );
  drawTextLine(event.location + (event.rink ? ` · ${event.rink}` : ""), margin, smallLine, false, muted);
  y -= 8;

  const colName = margin;
  const colLinePos = 180;
  const colEmail = 280;
  const colPhone = 440;

  // Roster (Going) section
  drawText("Roster (Going)", margin, 12, true);
  y -= 6;
  currentPage.drawText("Name", { x: colName, y, size: smallLine, font: fontBold, color: muted });
  currentPage.drawText("Line/Pos", { x: colLinePos, y, size: smallLine, font: fontBold, color: muted });
  currentPage.drawText("Email", { x: colEmail, y, size: smallLine, font: fontBold, color: muted });
  currentPage.drawText("Phone", { x: colPhone, y, size: smallLine, font: fontBold, color: muted });
  y -= lineHeight;

  function playerDisplayName(u: {
    nickname: string | null;
    firstName: string;
    lastName: string;
    jerseyNumber?: string | null;
    position?: string | null;
  }) {
    const name = u.nickname || `${u.firstName} ${u.lastName}`;
    const jersey = u.jerseyNumber ? ` #${u.jerseyNumber}` : "";
    const pos = u.position === "Goalie" ? " (Goalie)" : u.position ? ` (${u.position})` : "";
    return name + jersey + pos;
  }

  function formatLinePosition(r: { line?: number | null; assignedPosition?: string | null }) {
    const parts: string[] = [];
    if (r.line) parts.push(`L${r.line}`);
    if (r.assignedPosition) parts.push(r.assignedPosition);
    return parts.length > 0 ? parts.join(" ") : "—";
  }

  for (const r of going) {
    if (y < margin + lineHeight * 2) {
      currentPage = doc.addPage([pageWidth, pageHeight]);
      y = currentPage.getHeight() - margin;
    }
    const displayName = playerDisplayName(r.user);
    const linePos = formatLinePosition(r);
    const showContact = (r.user as { showContactToTeam?: boolean }).showContactToTeam !== false;
    const email = showContact ? (r.user.email || "—") : "—";
    const phone = showContact ? ((r.user as { phone?: string | null }).phone || "—") : "—";
    currentPage.drawText(displayName.slice(0, 24), { x: colName, y, size: smallLine, font, color: dark });
    currentPage.drawText(linePos.slice(0, 12), { x: colLinePos, y, size: smallLine, font, color: dark });
    currentPage.drawText(email.slice(0, 28), { x: colEmail, y, size: smallLine, font, color: dark });
    currentPage.drawText(phone.slice(0, 20), { x: colPhone, y, size: smallLine, font, color: dark });
    y -= lineHeight;
  }

  y -= lineHeight;
  if (waitlist.length > 0) {
    drawText("Waitlist", margin, 12, true);
    y -= 6;
    currentPage.drawText("Name", { x: colName, y, size: smallLine, font: fontBold, color: muted });
    currentPage.drawText("Line/Pos", { x: colLinePos, y, size: smallLine, font: fontBold, color: muted });
    currentPage.drawText("Email", { x: colEmail, y, size: smallLine, font: fontBold, color: muted });
    currentPage.drawText("Phone", { x: colPhone, y, size: smallLine, font: fontBold, color: muted });
    y -= lineHeight;
    for (const r of waitlist) {
      if (y < margin + lineHeight * 2) {
        currentPage = doc.addPage([pageWidth, pageHeight]);
        y = currentPage.getHeight() - margin;
      }
      const displayName = playerDisplayName(r.user);
      const linePos = formatLinePosition(r);
      const showContact = (r.user as { showContactToTeam?: boolean }).showContactToTeam !== false;
      const email = showContact ? (r.user.email || "—") : "—";
      const phone = showContact ? ((r.user as { phone?: string | null }).phone || "—") : "—";
      currentPage.drawText(displayName.slice(0, 24), { x: colName, y, size: smallLine, font, color: dark });
      currentPage.drawText(linePos.slice(0, 12), { x: colLinePos, y, size: smallLine, font, color: dark });
      currentPage.drawText(email.slice(0, 28), { x: colEmail, y, size: smallLine, font, color: dark });
      currentPage.drawText(phone.slice(0, 20), { x: colPhone, y, size: smallLine, font, color: dark });
      y -= lineHeight;
    }
  }

  const pdfBytes = await doc.save();
  const buffer = Buffer.from(pdfBytes);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="roster-${event.name.replace(/[^a-z0-9]/gi, "-").slice(0, 30)}.pdf"`,
    },
  });
}
