import Link from "next/link";
import { getSession } from "@/lib/auth";
import { NewsPostForm } from "../NewsPostForm";

export default async function NewNewsPostPage() {
  const session = await getSession();
  if (!session?.isAdmin) return null;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/news" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to news feed
      </Link>
      <h2 className="text-lg font-semibold text-zinc-900">New post</h2>
      <NewsPostForm />
    </div>
  );
}
