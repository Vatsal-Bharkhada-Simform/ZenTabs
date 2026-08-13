import Link from "next/link";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Sign in", href: "/login" },
  { label: "Create account", href: "/register" },
];

const companyLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-strong bg-canvas">
      <div className="max-w-[80rem] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-8">
          {/* Brand col */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-sm font-bold tracking-tight text-text-primary hover:opacity-70 transition-opacity w-fit"
            >
            ZenTabs
            </Link>
            <p className="text-sm text-text-secondary max-w-[32ch] leading-normal">
              ZenTabs is a personal bookmark manager with profiles, collections, and tag-based organisation.
            </p>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-mono uppercase tracking-widest text-text-muted">
              Product
            </p>
            <ul className="flex flex-col gap-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-mono uppercase tracking-widest text-text-muted">
              Legal
            </p>
            <ul className="flex flex-col gap-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-text-muted">
            &copy; {year} ZenTabs. All rights reserved.
          </p>
          <p className="text-xs text-text-muted font-mono">
            Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
