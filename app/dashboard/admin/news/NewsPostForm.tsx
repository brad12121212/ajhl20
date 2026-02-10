"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";

type Props = {
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialImages?: string[];
};

export function NewsPostForm({
  postId,
  initialTitle = "",
  initialContent = "",
  initialImages = [],
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    try {
      const res = await fetch("/api/admin/news/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.paths?.length) {
        setImages((prev) => [...prev, ...data.paths]);
      } else {
        setError(data.error || "Upload failed.");
      }
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(path: string) {
    setImages((prev) => prev.filter((p) => p !== path));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedTitle = title.trim();
    const trimmed = content.replace(/<[^>]*>/g, "").trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }
    if (!trimmed) {
      setError("Content is required.");
      return;
    }
    setSaving(true);
    try {
      const url = postId ? `/api/news/${postId}` : "/api/news";
      const method = postId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, content: content.trim(), images }),
      });
      if (res.ok) {
        router.push("/dashboard/admin/news");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save.");
      }
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!postId || !confirm("Delete this post? This cannot be undone.")) return;
    setSaving(true);
    const res = await fetch(`/api/news/${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/admin/news");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          placeholder="Post title"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Content</label>
        <p className="mt-1 mb-1 text-xs text-zinc-500">
          Select text and use the toolbar for bold, italic, underline, heading, or size.
        </p>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="What's the news?"
          minHeight="10rem"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Images</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((path) => (
            <div key={path} className="relative">
              <img
                src={path}
                alt=""
                className="h-20 w-20 rounded-lg border border-zinc-200 object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(path)}
                className="absolute -right-1 -top-1 rounded-full bg-red-600 p-0.5 text-white hover:bg-red-700"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading ? "…" : "+"}
          </label>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : postId ? "Update post" : "Publish"}
        </button>
        {postId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Delete post
          </button>
        )}
        <Link
          href="/dashboard/admin/news"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
