import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const { nickname, email, phone, jerseyNumber, secondaryJerseyNumber, thirdJerseyPreference, position, bio, usaHockey, profilePictureUrl, showContactToTeam } = body;

  const update: {
    nickname?: string | null;
    email?: string;
    phone?: string | null;
    jerseyNumber?: string | null;
    secondaryJerseyNumber?: string | null;
    thirdJerseyPreference?: string | null;
    position?: string | null;
    bio?: string | null;
    usaHockey?: string | null;
    profilePictureUrl?: string | null;
    showContactToTeam?: boolean;
  } = {};
  if (nickname !== undefined) update.nickname = nickname?.trim() || null;
  if (phone !== undefined) update.phone = phone?.trim() || null;
  if (jerseyNumber !== undefined) update.jerseyNumber = jerseyNumber?.trim() || null;
  if (secondaryJerseyNumber !== undefined) update.secondaryJerseyNumber = secondaryJerseyNumber?.trim() || null;
  if (thirdJerseyPreference !== undefined) update.thirdJerseyPreference = thirdJerseyPreference?.trim() || null;
  if (position !== undefined) update.position = position?.trim() || null;
  if (bio !== undefined) update.bio = bio?.trim() || null;
  if (usaHockey !== undefined) update.usaHockey = usaHockey?.trim() || null;
  if (profilePictureUrl !== undefined) update.profilePictureUrl = profilePictureUrl?.trim() || null;
  if (showContactToTeam !== undefined) update.showContactToTeam = Boolean(showContactToTeam);
  if (email !== undefined) {
    const emailNorm = email?.trim().toLowerCase();
    if (!emailNorm) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({
      where: { email: emailNorm, id: { not: session.userId } },
    });
    if (existing) {
      return NextResponse.json({ error: "That email is already in use by another account." }, { status: 400 });
    }
    update.email = emailNorm;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: update,
    select: { nickname: true, email: true, phone: true, jerseyNumber: true, secondaryJerseyNumber: true, thirdJerseyPreference: true, position: true, bio: true, usaHockey: true, profilePictureUrl: true, showContactToTeam: true },
  });
  return NextResponse.json(user);
}
