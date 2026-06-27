"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, User, UserPlus, type LucideIcon } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { shellStrings as t } from "@/lib/i18n";
import { nav } from "@/lib/nav";
import { cn } from "@/lib/utils";

const navLinkBase =
  "focus-visible:ring-point flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        navLinkBase,
        active
          ? "bg-point-soft text-point-hover font-bold"
          : "text-secondary-foreground hover:bg-muted font-semibold",
      )}
    >
      <Icon className="size-[18px]" />
      {label}
    </Link>
  );
}

export function Sidebar({
  isLoggedIn = false,
  syncedAt = "2026.06.16 09:00 KST",
}: {
  isLoggedIn?: boolean;
  syncedAt?: string;
}) {
  return (
    <nav className="border-border bg-card hidden h-full w-[244px] shrink-0 flex-col gap-1 overflow-y-auto border-r p-3 md:flex">
      {nav.map(({ href, labelKey, icon }) => (
        <NavLink key={href} href={href} icon={icon} label={t[labelKey]} />
      ))}

      {/* auth section */}
      <div className="border-border mt-1 flex flex-col gap-1 border-t pt-2">
        {isLoggedIn ? (
          <>
            <NavLink href="/mypage" icon={User} label={t.navMypage} />
            <LogoutButton className="text-secondary-foreground hover:bg-muted w-full justify-start px-3 py-2.5 text-sm font-semibold" />
          </>
        ) : (
          <>
            <NavLink href="/login" icon={LogIn} label={t.navLogin} />
            <NavLink href="/signup" icon={UserPlus} label={t.navSignup} />
          </>
        )}
      </div>

      {/* LIVE DATA / source card */}
      <div className="border-border bg-background mt-auto mb-2 rounded-xl border p-3">
        <div className="text-muted-foreground mb-1 flex items-center gap-1.5 font-mono text-[10px]">
          <span
            className="bg-point size-[7px] rounded-full"
            style={{ animation: "pol-blink 1.6s infinite" }}
          />
          {t.liveData}
        </div>
        <div className="text-muted-foreground text-[11px] leading-snug">
          {t.dataSource}
        </div>
        <div className="mt-1 font-mono text-[10px] text-[#94a3b8]">
          {syncedAt}
        </div>
      </div>
    </nav>
  );
}
