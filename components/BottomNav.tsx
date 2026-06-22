"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Minimalistische Linien-Icons (Tabler-Stil, stroke, runde Kappen).
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function RunIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="13" cy="4" r="1" />
      <path d="M4 17l5 1l.75 -1.5" />
      <path d="M15 21l0 -4l-4 -3l1 -6" />
      <path d="M7 12l0 -3l5 -1l3 3l3 1" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 17l6 -6l4 4l8 -8" />
      <path d="M14 7l7 0l0 7" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg {...iconProps}>
      <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
      <path d="M6 21v-1a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v1" />
    </svg>
  );
}

const ITEMS = [
  { href: "/", label: "Heute", Icon: RunIcon },
  { href: "/history", label: "Fortschritt", Icon: ProgressIcon },
  { href: "/profile", label: "Profil", Icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`nav-item${active ? " active" : ""}`}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon />
            <span className="nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
