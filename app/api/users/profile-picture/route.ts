import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabase, isSupabaseStorageConfigured } from "@/lib/supabase";
import { randomUUID } from "crypto";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const BUCKET = "profiles";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file." }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    if (isSupabaseStorageConfigured()) {
      const supabase = getSupabase();
      const ext = path.extname(file.name) || ".jpg";
      const filePath = `${randomUUID()}${ext}`;

      const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

      if (error) {
        console.error("Profile picture upload error:", error);
        return NextResponse.json(
          { error: error.message || "Upload failed." },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      return NextResponse.json({ url: publicUrl });
    }

    return NextResponse.json(
      {
        error:
          "Image upload is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and create a public Storage bucket named 'profiles'.",
      },
      { status: 503 }
    );
  } catch (e) {
    console.error("Profile picture upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
