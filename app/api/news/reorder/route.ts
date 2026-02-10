import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

/** PATCH: reorder news posts (admin only). Body: { order: string[] } ids in desired order (first = top). */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await req.json();
  const order = body.order;
  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ error: "order array required." }, { status: 400 });
  }

  const updates = order.map((id: string, index: number) => ({
    id,
    position: order.length - 1 - index,
  }));
  for (const u of updates) {
    await prisma.newsPost.update({
      where: { id: u.id },
      data: { position: u.position },
    });
  }
  return NextResponse.json({ ok: true });
}
