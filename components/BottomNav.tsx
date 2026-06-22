"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

function CalendarIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M4 9h16" />
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

function SettingsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const LEFT = [
  { href: "/", label: "Heute", Icon: RunIcon },
  { href: "/history", label: "Kalender", Icon: CalendarIcon },
];
const RIGHT = [
  { href: "/profile", label: "Profil", Icon: ProfileIcon },
  { href: "/settings", label: "Einstellungen", Icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("vervou_nav_seen");
    if (!seen) {
      setExpanded(true);
      const t = setTimeout(() => {
        setExpanded(false);
        localStorage.setItem("vervou_nav_seen", "1");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const item = ({ href, label, Icon }: (typeof LEFT)[number]) => (
    <Link
      key={href}
      href={href}
      className={`nav-item${isActive(href) ? " active" : ""}`}
      aria-label={label}
      aria-current={isActive(href) ? "page" : undefined}
      tabIndex={expanded ? 0 : -1}
    >
      <Icon />
    </Link>
  );

  return (
    <nav className={`bottom-nav${expanded ? " expanded" : " collapsed"}`}>
      {LEFT.map(item)}

      <button
        className="nav-toggle"
        onClick={() => setExpanded((e) => !e)}
        aria-label={expanded ? "Menü einklappen" : "Menü öffnen"}
      >
        <img src="/vmark.svg" alt="vervou" width={26} height={26} />
      </button>

      {RIGHT.map(item)}
    </nav>
  );
}
