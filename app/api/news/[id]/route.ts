import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeNewsContent } from "@/lib/sanitize";

/** PATCH: update news post (admin only) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { title, content, images } = body;

    const data: { title?: string; content?: string; images?: string | null } = {};
    if (title !== undefined) {
      const t = typeof title === "string" ? title.trim() : "";
      if (!t) return NextResponse.json({ error: "Title is required." }, { status: 400 });
      data.title = t;
    }
    if (content !== undefined) data.content = sanitizeNewsContent(content.trim());
    if (images !== undefined) data.images = Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : null;

    const post = await prisma.newsPost.update({
      where: { id },
      data,
    });
    return NextResponse.json({
      post: { ...post, images: post.images ? JSON.parse(post.images) : [] },
    });
  } catch (err) {
    console.error("[PATCH /api/news/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update post" },
      { status: 500 }
    );
  }
}

/** DELETE: delete news post (admin only) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  await prisma.newsPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
