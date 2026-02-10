import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";
import { ProfileEditClient } from "./ProfileEditClient";
import { ProfilePasswordClient } from "./ProfilePasswordClient";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      nickname: true,
      jerseyNumber: true,
      secondaryJerseyNumber: true,
      thirdJerseyPreference: true,
      position: true,
      bio: true,
      usaHockey: true,
      profilePictureUrl: true,
      showContactToTeam: true,
    },
  });
  const prefs = await prisma.emailPreferences.findUnique({
    where: { userId: session.userId },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Profile</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <p className="text-sm text-zinc-500">Email: {user.email}</p>
      </div>
      <ProfileEditClient
        nickname={user.nickname}
        email={user.email}
        phone={user.phone}
        jerseyNumber={user.jerseyNumber}
        secondaryJerseyNumber={user.secondaryJerseyNumber}
        thirdJerseyPreference={user.thirdJerseyPreference}
        position={user.position}
        bio={user.bio}
        usaHockey={user.usaHockey}
        profilePictureUrl={user.profilePictureUrl}
        showContactToTeam={user.showContactToTeam ?? true}
      />
      <ProfilePasswordClient userEmail={user.email} />
      <ProfileClient
        reminderEvents={prefs?.reminderEvents ?? true}
        reminderWaitlistMoved={prefs?.reminderWaitlistMoved ?? true}
      />
    </div>
  );
}
