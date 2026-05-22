import Link from "next/link";
import { site } from "@/lib/site";

const links = [
  { href: "/work", label: "作品" },
  { href: "/writing", label: "Blog" },
  { href: "/services", label: "服务" },
  { href: "/about", label: "关于我" },
];

export default function Nav() {
  return (
    <header className="w-full">
      <div className="notebook-shell pt-8 pb-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="hover:opacity-70 transition inline-block leading-none"
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: "1.9rem",
            transform: "rotate(-1.5deg)",
            letterSpacing: "-0.01em",
          }}
          aria-label={`${site.name} — Home`}
        >
          {site.name}
          <span style={{ color: "var(--red-pen)" }}>.</span>
        </Link>
        <nav className="flex items-baseline gap-5 sm:gap-7 text-sm text-muted">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-foreground transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
