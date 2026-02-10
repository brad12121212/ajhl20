import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabase, isSupabaseStorageConfigured } from "@/lib/supabase";
import { randomUUID } from "crypto";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const BUCKET = "news";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    if (!files.length) return NextResponse.json({ error: "No files." }, { status: 400 });

    if (!isSupabaseStorageConfigured()) {
      return NextResponse.json(
        {
          error:
            "Image upload is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and create a public Storage bucket named 'news'.",
        },
        { status: 503 }
      );
    }

    const supabase = getSupabase();
    const paths: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_SIZE) continue;

      const ext = path.extname(file.name) || ".jpg";
      const filePath = `${randomUUID()}${ext}`;

      const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

      if (error) {
        console.error("News upload error:", error);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      paths.push(publicUrl);
    }

    return NextResponse.json({ paths });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
