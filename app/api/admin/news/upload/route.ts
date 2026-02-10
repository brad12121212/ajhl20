import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "news");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    if (!files.length) return NextResponse.json({ error: "No files." }, { status: 400 });

    await mkdir(UPLOAD_DIR, { recursive: true });
    const paths: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_SIZE) continue;

      const ext = path.extname(file.name) || ".jpg";
      const name = `${randomUUID()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, name);
      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));
      paths.push(`/uploads/news/${name}`);
    }

    return NextResponse.json({ paths });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
