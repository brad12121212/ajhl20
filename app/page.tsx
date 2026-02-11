import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HomeClient } from "./HomeClient";

function safeParseImages(images: string | null): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const session = await getSession();
  let postsWithImages: Array<{
    id: string;
    title: string;
    content: string;
    images: string[];
    createdAt: string;
    updatedAt: Date;
    position: number;
  }> = [];

  try {
    const posts = await prisma.newsPost.findMany({
      orderBy: [{ position: "desc" }, { createdAt: "desc" }],
    });
    postsWithImages = posts.map((p) => ({
      ...p,
      images: safeParseImages(p.images),
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Home page failed to load news posts:", error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero: logo as background with dark overlay */}
      <section
        className="relative flex min-h-[420px] flex-col items-center justify-center bg-zinc-900 px-4 py-16"
        style={{
          backgroundImage: "url(/bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-zinc-900/85" aria-hidden />
        <div className="relative z-10 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="AJHL"
            width={600}
            height={180}
            className="logo-hero h-60 w-auto sm:h-72"
            priority
          />
          <h1 className="mt-4 text-3xl font-bold uppercase tracking-wide text-white sm:text-4xl">
            AJHL <span className="text-red-500">2.0</span>
          </h1>
          <p className="mt-3 max-w-lg text-lg text-zinc-300">
            A recreational hockey league committed to fun, safe play, and the bonds of friendship.
          </p>
          <Link
            href="/schedule"
            className="mt-6 rounded bg-red-600 px-6 py-3 font-medium uppercase tracking-wide text-white hover:bg-red-500"
          >
            View events
          </Link>
        </div>
      </section>
      <main className="mx-auto max-w-2xl px-4 py-10">
        <HomeClient posts={postsWithImages} isAdmin={session?.isAdmin ?? false} isLoggedIn={!!session} />
      </main>
    </div>
  );
}
