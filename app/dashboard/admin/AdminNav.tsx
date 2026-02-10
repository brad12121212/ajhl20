"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard/admin", label: "Events", exact: true },
  { href: "/dashboard/admin/news", label: "News feed", exact: false },
  { href: "/dashboard/admin/email", label: "Send email", exact: false },
  { href: "/dashboard/admin/reports", label: "Reports", exact: false },
  { href: "/dashboard/admin/audit", label: "Audit log", exact: false },
  { href: "/dashboard/admin/users", label: "Accounts", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="-mx-4 flex shrink-0 gap-4 overflow-x-auto px-4 pb-1 text-sm sm:mx-0 sm:px-0 sm:pb-0"
      aria-label="Admin sections"
    >
      {LINKS.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap border-b-2 pb-0.5 ${
              isActive
                ? "border-zinc-900 font-medium text-zinc-900"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
