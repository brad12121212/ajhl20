import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NewsFeedClient } from "./NewsFeedClient";

export default async function AdminNewsPage() {
  const session = await getSession();
  if (!session?.isAdmin) return null;

  const posts = await prisma.newsPost.findMany({
    orderBy: [{ position: "desc" }, { createdAt: "desc" }],
  });
  const withImages = posts.map((p) => ({
    ...p,
    images: p.images ? (JSON.parse(p.images) as string[]) : [],
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">News feed</h2>
        <Link
          href="/dashboard/admin/news/new"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          + New post
        </Link>
      </div>
      <NewsFeedClient posts={withImages} />
    </div>
  );
}
