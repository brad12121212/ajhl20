import Link from "next/link";

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/ajhl20", icon: "instagram" },
  { label: "Facebook", href: "https://www.facebook.com/ajhl20", icon: "facebook" },
] as const;

const FOOTER_LINKS = [
  { href: "/", label: "News" },
  { href: "/schedule", label: "Events" },
  { href: "/rules", label: "Rules" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900 text-zinc-400">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white">
              AJHL <span className="text-red-500">2.0</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              A recreational hockey league committed to fun, safe play, and the bonds of friendship.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Quick links
            </p>
            <ul className="mt-3 space-y-1.5">
              {FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm uppercase tracking-wide text-zinc-400 transition hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Resources
            </p>
            <ul className="mt-3 space-y-1.5">
              <li>
                <Link
                  href="/contact"
                  className="text-sm uppercase tracking-wide text-zinc-400 transition hover:text-white"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/rules"
                  className="text-sm uppercase tracking-wide text-zinc-400 transition hover:text-white"
                >
                  Rules
                </Link>
              </li>
              <li>
                <a
                  href="https://ajhl20.hockeyshift.com/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm uppercase tracking-wide text-zinc-400 transition hover:text-white"
                >
                  Hockeyshift
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Follow us
            </p>
            <ul className="mt-3 flex gap-4">
              {SOCIAL.map(({ label, href, icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm uppercase tracking-wide text-zinc-400 transition hover:text-white"
                    aria-label={label}
                  >
                    {icon === "instagram" && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {icon === "facebook" && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="hidden sm:inline">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs uppercase tracking-wide text-zinc-500">
          © {year} AJHL <span className="text-red-500">2.0</span>. All rights reserved.
          <br />
          <span className="mt-2 block">
            Website designed by{" "}
            <a
              href="https://zapconsultingllc.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 transition hover:text-white hover:underline"
            >
              ZAP Marketing
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
