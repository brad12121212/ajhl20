import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const TESTER_PASSWORD = "Test1234";
const TEST_USERS = [
  { firstName: "Alex", email: "tester1@example.com", bio: "Forward. Been playing in the league for two seasons. Prefer left wing." },
  { firstName: "Sam", email: "tester2@example.com", bio: "Defense. Love blocking shots and breaking out of the zone." },
  { firstName: "Jordan", email: "tester3@example.com", bio: "Goalie. C3/C2 level. Happy to sub when needed." },
  { firstName: "Casey", email: "tester4@example.com", bio: "Forward / sometimes D. Just here to have fun and skate hard." },
  { firstName: "Riley", email: "tester5@example.com", bio: "Defense. USA Hockey certified. Available most weekends." },
];

async function main() {
  const hash = await bcrypt.hash("Password123", 10);
  const adminEmail = "ajhl20@gmail.com";
  const oldAdmin = await prisma.user.findFirst({ where: { username: "Admin123" } });
  if (oldAdmin) {
    await prisma.user.update({ where: { id: oldAdmin.id }, data: { username: "admin123" } });
  }
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      username: "admin123",
      passwordHash: hash,
      email: adminEmail,
      firstName: "Admin",
      lastName: "User",
      phone: "+15550000000",
      isAdmin: true,
    },
    update: { passwordHash: hash, isAdmin: true, username: "admin123" },
  });
  console.log("Seeded default admin: admin123 / Password123 (login with username or email)");

  const profilesDir = path.join(process.cwd(), "public", "uploads", "profiles");
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }
  const existingImages = fs.readdirSync(profilesDir).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  const existingImage = existingImages.length > 0 ? path.join(profilesDir, existingImages[0]) : null;
  const testerHash = await bcrypt.hash(TESTER_PASSWORD, 10);
  const credentials: string[] = ["# AJHL test accounts (use Email to log in)", "", "Email | Password | Note", "------|----------|-------"];

  for (let i = 0; i < TEST_USERS.length; i++) {
    const u = TEST_USERS[i];
    const lastName = "Tester";
    const username = u.email.toLowerCase();
    const profileFilename = `tester${i + 1}.png`;
    const profilePath = path.join(profilesDir, profileFilename);
    const profilePictureUrl = `/uploads/profiles/${profileFilename}`;
    const isGoalie = i === 2;

    if (existingImage) {
      try {
        fs.copyFileSync(existingImage, profilePath);
      } catch {
        // ignore if copy fails
      }
    }

    await prisma.user.upsert({
      where: { username },
      create: {
        username,
        passwordHash: testerHash,
        email: u.email,
        firstName: u.firstName,
        lastName,
        nickname: u.firstName,
        bio: u.bio,
        profilePictureUrl: fs.existsSync(profilePath) ? profilePictureUrl : null,
        position: isGoalie ? "Goalie" : i % 2 === 0 ? "Forward" : "Defense",
        jerseyNumber: String((i % 20) + 5),
      },
      update: {
        passwordHash: testerHash,
        firstName: u.firstName,
        lastName,
        nickname: u.firstName,
        bio: u.bio,
        profilePictureUrl: fs.existsSync(profilePath) ? profilePictureUrl : null,
        position: isGoalie ? "Goalie" : i % 2 === 0 ? "Forward" : "Defense",
        jerseyNumber: String((i % 20) + 5),
      },
    });
    credentials.push(`${u.email} | ${TESTER_PASSWORD} | ${isGoalie ? "**Goalie**" : ""}`);
  }

  const credPath = path.join(process.cwd(), "TEST_ACCOUNTS.md");
  fs.writeFileSync(credPath, credentials.join("\n") + "\n", "utf-8");
  console.log("Seeded 5 test accounts. Logins saved to TEST_ACCOUNTS.md");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
