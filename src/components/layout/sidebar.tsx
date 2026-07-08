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

/** collapsed 상태에서 라벨 숨김 → 사이드바 hover 시 페이드 인 */
const collapsedLabel =
  "opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:delay-75";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  icon: Icon,
  label,
  collapsed,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
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
      <Icon className="size-[18px] shrink-0" />
      <span
        className={cn(
          "transition-opacity duration-150",
          collapsed && collapsedLabel,
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function Sidebar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  // 홈에서는 아이콘 레일만 노출해 지도를 와이드하게 — hover 시 오버레이로 확장
  const collapsed = pathname === "/";
  return (
    <div
      className={cn(
        "relative z-40 hidden shrink-0 md:block",
        collapsed ? "w-[68px]" : "w-[244px]",
      )}
    >
      <nav
        className={cn(
          "border-border bg-card group/sidebar absolute inset-y-0 left-0 z-30 flex flex-col gap-1 overflow-x-hidden overflow-y-auto border-r p-3 transition-[width] duration-200 ease-out",
          collapsed
            ? "w-[68px] hover:w-[244px] hover:shadow-[8px_0_24px_rgba(31,58,138,0.12)]"
            : "w-full",
        )}
      >
        {nav.map(({ href, labelKey, icon }) => (
          <NavLink
            key={href}
            href={href}
            icon={icon}
            label={t[labelKey]}
            collapsed={collapsed}
          />
        ))}

        {/* auth section */}
        <div className="border-border mt-1 flex flex-col gap-1 border-t pt-2">
          {isLoggedIn ? (
            <>
              <NavLink
                href="/mypage"
                icon={User}
                label={t.navMypage}
                collapsed={collapsed}
              />
              <LogoutButton
                className={cn(
                  "text-secondary-foreground hover:bg-muted w-full justify-start px-3 py-2.5 text-sm font-semibold",
                  collapsed &&
                    "[&_[data-label]]:opacity-0 [&_[data-label]]:transition-opacity group-hover/sidebar:[&_[data-label]]:opacity-100 group-hover/sidebar:[&_[data-label]]:delay-75",
                )}
              />
            </>
          ) : (
            <>
              <NavLink
                href="/login"
                icon={LogIn}
                label={t.navLogin}
                collapsed={collapsed}
              />
              <NavLink
                href="/signup"
                icon={UserPlus}
                label={t.navSignup}
                collapsed={collapsed}
              />
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
