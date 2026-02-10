import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "profiles");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file." }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(file.name) || ".jpg";
    const name = `${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, name);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    const url = `/uploads/profiles/${name}`;

    return NextResponse.json({ url });
  } catch (e) {
    console.error("Profile picture upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
