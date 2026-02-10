"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Post = {
  id: string;
  title: string;
  content: string;
  images: string[];
  position: number;
  createdAt: string;
};

type Props = { posts: Post[] };

export function NewsFeedClient({ posts: initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [moving, setMoving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function moveUp(id: string) {
    const i = posts.findIndex((p) => p.id === id);
    if (i <= 0) return;
    setMoving(id);
    const newOrder = [...posts];
    [newOrder[i - 1], newOrder[i]] = [newOrder[i], newOrder[i - 1]];
    const order = newOrder.map((p) => p.id);
    const res = await fetch("/api/news/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    if (res.ok) {
      setPosts(newOrder);
      router.refresh();
    }
    setMoving(null);
  }

  async function moveDown(id: string) {
    const i = posts.findIndex((p) => p.id === id);
    if (i < 0 || i >= posts.length - 1) return;
    setMoving(id);
    const newOrder = [...posts];
    [newOrder[i], newOrder[i + 1]] = [newOrder[i + 1], newOrder[i]];
    const order = newOrder.map((p) => p.id);
    const res = await fetch("/api/news/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    if (res.ok) {
      setPosts(newOrder);
      router.refresh();
    }
    setMoving(null);
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    setDeleting(id);
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
    setDeleting(null);
  }

  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-white py-8 text-center text-zinc-500">
        No posts yet.{" "}
        <Link href="/dashboard/admin/news/new" className="text-red-600 hover:underline">
          Create one
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((post, i) => (
        <li
          key={post.id}
          className="flex items-start gap-2 rounded-lg border border-zinc-200 bg-white p-3"
        >
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => moveUp(post.id)}
              disabled={i === 0 || moving !== null}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30"
              title="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveDown(post.id)}
              disabled={i === posts.length - 1 || moving !== null}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30"
              title="Move down"
            >
              ↓
            </button>
          </div>
          <div className="min-w-0 flex-1">
            {post.title ? (
              <p className="font-medium text-zinc-900">{post.title}</p>
            ) : null}
            <p className="line-clamp-2 text-sm text-zinc-700">{post.content.replace(/<[^>]*>/g, " ").trim()}</p>
            {post.images.length > 0 && (
              <p className="mt-1 text-xs text-zinc-500">{post.images.length} image(s)</p>
            )}
            <p className="mt-1 text-xs text-zinc-400">
              {format(new Date(post.createdAt), "MMM d, h:mm a")}
            </p>
          </div>
          <div className="flex gap-1">
            <Link
              href={`/dashboard/admin/news/${post.id}/edit`}
              className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => deletePost(post.id)}
              disabled={deleting !== null}
              className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting === post.id ? "…" : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
