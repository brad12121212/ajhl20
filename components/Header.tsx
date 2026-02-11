import Link from "next/link";
import Image from "next/image";
import type { SessionPayload } from "@/lib/auth";
import { NavLinks } from "@/components/NavLinks";

type Props = { session: SessionPayload | null };

export function Header({ session }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900 shadow-lg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 min-h-0 max-w-5xl items-center justify-between gap-3 px-3 sm:h-16 sm:gap-4 sm:px-4">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <Image
            src="/logo.png"
            alt="AJHL"
            width={120}
            height={36}
            className="h-7 w-auto sm:h-9"
            priority
          />
          <span className="truncate text-sm font-semibold uppercase tracking-wide text-white sm:text-base">
            AJHL <span className="text-red-500">2.0</span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NavLinks session={session} />
        </nav>
      </div>
    </header>
  );
}
