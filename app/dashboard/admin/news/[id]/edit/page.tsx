import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NewsPostForm } from "../../NewsPostForm";

export default async function EditNewsPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.isAdmin) return null;

  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();

  const images = post.images ? (JSON.parse(post.images) as string[]) : [];

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/news" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to news feed
      </Link>
      <h2 className="text-lg font-semibold text-zinc-900">Edit post</h2>
      <NewsPostForm
        postId={post.id}
        initialTitle={post.title ?? ""}
        initialContent={post.content}
        initialImages={images}
      />
    </div>
  );
}
