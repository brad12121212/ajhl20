import Link from "next/link";
import Image from "next/image";
import type { SessionPayload } from "@/lib/auth";
import { NavLinks } from "@/components/NavLinks";

type Props = { session: SessionPayload | null };

export function Header({ session }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900 shadow-lg">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="AJHL"
            width={120}
            height={36}
            className="h-9 w-auto"
            priority
          />
          <span className="font-semibold uppercase tracking-wide text-white">
            AJHL <span className="text-red-500">2.0</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLinks session={session} />
        </nav>
      </div>
    </header>
  );
}
