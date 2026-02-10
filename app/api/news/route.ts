import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeNewsContent } from "@/lib/sanitize";

/** GET: list news posts, newest first (by position desc then createdAt desc) */
export async function GET() {
  try {
    const posts = await prisma.newsPost.findMany({
      orderBy: [{ position: "desc" }, { createdAt: "desc" }],
    });
    const withParsedImages = posts.map((p) => ({
      id: p.id,
      title: p.title ?? "",
      content: p.content,
      images: p.images ? (JSON.parse(p.images) as string[]) : [],
      position: p.position,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
    return NextResponse.json({ posts: withParsedImages });
  } catch (err) {
    console.error("[GET /api/news]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load news" },
      { status: 500 }
    );
  }
}

/** POST: create news post (admin only) */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  try {
    const body = await req.json();
    const { title, content, images } = body;
    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    if (!trimmedTitle) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (!content?.trim()) return NextResponse.json({ error: "Content is required." }, { status: 400 });

    const max = await prisma.newsPost.aggregate({ _max: { position: true } });
    const position = (max._max.position ?? -1) + 1;
    const imagesJson = Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : null;

    const post = await prisma.newsPost.create({
      data: {
        title: trimmedTitle,
        content: sanitizeNewsContent(content.trim()),
        images: imagesJson,
        position,
      },
    });
    return NextResponse.json({
      post: {
        ...post,
        images: Array.isArray(images) ? images : (post.images ? (JSON.parse(post.images) as string[]) : []),
      },
    });
  } catch (err) {
    console.error("[POST /api/news]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create post" },
      { status: 500 }
    );
  }
}
