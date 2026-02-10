"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { stripHtml } from "@/lib/sanitize";

const TRUNCATE_LEN = 280;
const POSTS_PER_PAGE = 5;

type Post = {
  id: string;
  title: string;
  content: string;
  images: string[];
  position: number;
  createdAt: string;
};

type Props = {
  posts: Post[];
  isAdmin: boolean;
  isLoggedIn: boolean;
};

export function HomeClient({ posts, isAdmin, isLoggedIn }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedPosts = posts.slice(
    currentPage * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE + POSTS_PER_PAGE
  );
  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1 && posts.length > POSTS_PER_PAGE;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {!isLoggedIn && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="w-full rounded border-2 border-zinc-300 bg-white px-4 py-3 text-center text-sm font-medium uppercase tracking-wide text-zinc-700 hover:border-red-500 hover:bg-zinc-50 hover:text-red-600 sm:w-auto"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="w-full rounded bg-red-600 px-4 py-3 text-center text-sm font-medium uppercase tracking-wide text-white hover:bg-red-500 sm:w-auto"
          >
            Sign up
          </Link>
        </div>
      )}

      {isAdmin && (
        <div className="flex justify-center">
          <Link
            href="/dashboard/admin/news"
            className="rounded-lg border-2 border-dashed border-red-300 bg-red-50/50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            + Post to news feed
          </Link>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-zinc-900">
          News <span className="text-red-600">feed</span>
        </h2>
        {posts.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-white py-8 text-center text-zinc-500">
            No posts yet.
            {isAdmin && " Use the button above to add one."}
          </p>
        ) : (
          <>
            <ul className="space-y-4">
              {paginatedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </ul>
            {posts.length > POSTS_PER_PAGE && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={!hasPrev}
                  className="rounded border-2 border-zinc-300 bg-white px-4 py-2 text-sm font-medium uppercase tracking-wide text-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-red-500 hover:bg-zinc-50 hover:text-red-600 disabled:hover:border-zinc-300 disabled:hover:bg-white disabled:hover:text-zinc-700"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-600">
                  {currentPage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={!hasNext}
                  className="rounded border-2 border-zinc-300 bg-white px-4 py-2 text-sm font-medium uppercase tracking-wide text-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-red-500 hover:bg-zinc-50 hover:text-red-600 disabled:hover:border-zinc-300 disabled:hover:bg-white disabled:hover:text-zinc-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-zinc-900">
          Mission <span className="text-red-600">statement</span>
        </h2>
        <p className="mt-2 text-sm text-zinc-700">
          At AJHL2.0 Hockey LLC, our mission is to create a vibrant, inclusive, and thriving hockey community that values fairness, fun, safe play, and the enduring bonds of friendship. We are committed to nurturing an environment where all types of hockey players, regardless of skill level, age, or background, can come together to enjoy the game they love while building lasting connections on and off the ice.
        </p>
        <p className="mt-3 text-sm text-zinc-700">
          <strong>Our core values:</strong> Fair Play, Fun-Focused, Safety Above All, Inclusivity, Friendships Matter, Community Building.
        </p>
        <p className="mt-2 text-sm text-zinc-700">
          We envision AJHL2.0 as synonymous with an accessible, respectful, and camaraderie-filled hockey experience—a level playing field, joyous atmosphere, unwavering safety, inclusivity for all, and enduring friendship.
        </p>
      </section>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const plainLength = stripHtml(post.content).length;
  const isLong = plainLength > TRUNCATE_LEN;
  const showTruncated = isLong && !expanded;
  const displayContent = showTruncated
    ? stripHtml(post.content).slice(0, TRUNCATE_LEN) + "…"
    : post.content;

  return (
    <li className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      {post.title ? (
        <h3 className="text-base font-semibold text-zinc-900">{post.title}</h3>
      ) : null}
      <div className={`prose prose-sm max-w-none text-zinc-700 prose-p:my-1 prose-headings:my-2 ${post.title ? "mt-1" : ""}`}>
        {showTruncated ? (
          <>{displayContent}</>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: displayContent }} />
        )}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-medium text-red-600 hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
      {post.images.length > 0 && (
        <ImageGrid images={post.images} />
      )}
      <p className="mt-3 text-xs text-zinc-400">
        {format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
      </p>
    </li>
  );
}

function ImageGrid({ images }: { images: string[] }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        {images.map((src) => (
          <button
            type="button"
            key={src}
            onClick={() => setLightboxSrc(src)}
            className="relative h-40 w-40 overflow-hidden rounded-lg border border-zinc-200 text-left transition hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
          aria-label="View image"
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-zinc-700 hover:bg-white"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
