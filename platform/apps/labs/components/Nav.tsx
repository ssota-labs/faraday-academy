"use client";

import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/components", label: "Components" },
  { href: "/skills", label: "Skills & Packs" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 text-sm">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <a key={l.href} href={l.href} data-active={active} className="navlink px-3 py-1.5">
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
