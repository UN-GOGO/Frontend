"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { shellStrings as t } from "@/lib/i18n";
import { bottomNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Mobile-only bottom tab bar (hidden ≥ md, where the sidebar takes over). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-border bg-card flex h-[62px] shrink-0 items-stretch border-t md:hidden">
      {bottomNav.map(({ href, labelKey, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-visible:bg-muted flex flex-1 flex-col items-center justify-center gap-1 outline-none",
              active ? "text-point-hover" : "text-[#94a3b8]",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={active ? 2.4 : 2} />
            <span className="text-[10px] font-bold">{t[labelKey]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
