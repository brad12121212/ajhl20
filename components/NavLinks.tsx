"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionPayload } from "@/lib/auth";

type Props = { session: SessionPayload | null };

function NavLink({
  href,
  children,
  exact = false,
  external = false,
  variant = "nav",
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  external?: boolean;
  variant?: "nav" | "dropdown";
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  const base = "text-xs font-medium uppercase tracking-wide sm:text-sm ";
  const activeStyle = "text-red-400";
  const inactiveStyle = "text-zinc-300 hover:text-white";
  const navClass =
    base +
    "rounded border-2 border-transparent px-2 py-1 " +
    (isActive ? "border-red-500 " + activeStyle : inactiveStyle);
  const dropdownClass =
    base +
    "block rounded px-2 py-1.5 text-left " +
    (isActive ? activeStyle : inactiveStyle + " hover:bg-zinc-800");
  const className = variant === "dropdown" ? dropdownClass : navClass;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return <Link href={href} className={className}>{children}</Link>;
}

const RESOURCES_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: "/contact", label: "Contact", external: false },
  { href: "/rules", label: "Rules", external: false },
  { href: "https://ajhl20.hockeyshift.com/home", label: "Hockeyshift", external: true },
];

export function NavLinks({ session }: Props) {
  const pathname = usePathname();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdminActive = pathname.startsWith("/dashboard/admin");
  const isResourcesActive = pathname === "/rules" || pathname === "/contact" || pathname.startsWith("/rules/") || pathname.startsWith("/contact/");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const desktopLinks = (
    <>
      <NavLink href="/" exact>News</NavLink>
      <NavLink href="/schedule">Events</NavLink>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setResourcesOpen((o) => !o)}
          className={`rounded border-2 border-transparent px-2 py-1 text-xs font-medium uppercase tracking-wide sm:text-sm ${
            isResourcesActive ? "border-red-500 text-red-400" : "text-zinc-300 hover:text-white"
          }`}
          aria-expanded={resourcesOpen}
          aria-haspopup="true"
        >
          Resources ▾
        </button>
        {resourcesOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded border border-zinc-700 bg-zinc-800 py-1 shadow-xl">
            {RESOURCES_LINKS.map(({ href, label, external }) => (
              <NavLink
                key={href}
                href={href}
                exact={!external}
                external={!!external}
                variant="dropdown"
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
      {session ? (
        <>
          <NavLink href="/dashboard" exact>My schedule</NavLink>
          <NavLink href="/dashboard/profile">Profile</NavLink>
          {session.isAdmin && (
            <Link
              href="/dashboard/admin"
              className={`rounded border-2 border-transparent px-3 py-1.5 text-xs font-medium uppercase tracking-wide sm:text-sm ${
                isAdminActive
                  ? "border-red-500 bg-red-600 text-white"
                  : "border-transparent bg-red-600 text-white hover:bg-red-500"
              }`}
            >
              Admin
            </Link>
          )}
          <form action="/api/auth/logout" method="POST" className="inline-block">
            <button
              type="submit"
              className="rounded border-2 border-transparent px-2 py-1 text-xs font-medium uppercase tracking-wide text-zinc-400 hover:text-white sm:text-sm"
            >
              Log out
            </button>
          </form>
        </>
      ) : (
        <>
          <NavLink href="/login">Log in</NavLink>
          <Link
            href="/register"
            className="rounded border-2 border-transparent px-2 py-1 text-xs font-medium uppercase tracking-wide text-white bg-red-600 hover:bg-red-500 sm:text-sm"
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );

  const mobileLinks = (
    <>
      <NavLink href="/" exact>News</NavLink>
      <NavLink href="/schedule">Events</NavLink>
      {RESOURCES_LINKS.map(({ href, label, external }) => (
        <NavLink key={href} href={href} exact={!external} external={!!external} variant="dropdown">
          {label}
        </NavLink>
      ))}
      {session ? (
        <>
          <NavLink href="/dashboard" exact>My schedule</NavLink>
          <NavLink href="/dashboard/profile">Profile</NavLink>
          {session.isAdmin && (
            <Link
              href="/dashboard/admin"
              className={`rounded border-2 border-transparent px-2 py-1.5 text-xs font-medium uppercase tracking-wide ${
                isAdminActive
                  ? "border-red-500 bg-red-600 text-white"
                  : "border-transparent bg-red-600 text-white hover:bg-red-500"
              }`}
            >
              Admin
            </Link>
          )}
          <form action="/api/auth/logout" method="POST" className="inline-block">
            <button
              type="submit"
              className="rounded border-2 border-transparent px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 hover:text-white"
            >
              Log out
            </button>
          </form>
        </>
      ) : (
        <>
          <NavLink href="/login">Log in</NavLink>
          <Link
            href="/register"
            className="rounded border-2 border-transparent px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-white bg-red-600 hover:bg-red-500"
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="hidden items-center gap-1 sm:flex sm:gap-2">{desktopLinks}</nav>
      <div className="relative flex sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="rounded p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              aria-hidden
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[280px] flex-col border-l border-zinc-700 bg-zinc-900 py-6 pl-6 pr-4 shadow-xl">
              <div className="flex flex-col gap-2">{mobileLinks}</div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
