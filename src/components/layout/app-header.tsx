import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { shellStrings as t } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export async function AppHeader({ hasUnread = true }: { hasUnread?: boolean }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name = ((user?.user_metadata?.name as string | undefined) ?? "").trim();
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="border-border text-foreground flex h-15 shrink-0 items-center justify-between border-b bg-white px-3.5 sm:px-5">
      {/* Logo + tagline */}
      <Link
        href="/"
        className="focus-visible:ring-point flex items-center gap-2 rounded-md outline-none focus-visible:ring-2"
      >
        <BrandMark />
        <span className="flex flex-col leading-[1.05]">
          <span className="text-[17px] font-extrabold tracking-tight">
            I-OGO
          </span>
          <span className="text-muted-foreground hidden text-[9.5px] font-medium min-[360px]:inline-block sm:text-[10px]">
            {t.tagline}
          </span>
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3.5">
        {user ? (
          <>
            {/* Notifications */}
            <Link
              href="/notifications"
              aria-label={t.notifAria}
              className="focus-visible:ring-point hover:bg-point-soft bg-secondary relative flex size-8.5 items-center justify-center rounded-[9px] transition-colors outline-none focus-visible:ring-2"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {hasUnread && (
                <span className="bg-point absolute top-1.5 right-2 size-2 rounded-full border-[1.5px] border-white" />
              )}
            </Link>

            {/* Avatar → mypage */}
            <Link
              href="/mypage"
              aria-label={t.mypageAria}
              className="focus-visible:ring-point hover:bg-secondary flex items-center gap-2 rounded-md py-1 pr-2 pl-1 transition-colors outline-none focus-visible:ring-2"
            >
              <span className="bg-point-soft text-point-hover flex size-8 items-center justify-center rounded-full text-[13px] font-extrabold">
                {initial}
              </span>
              <span className="text-foreground hidden text-[13px] font-semibold whitespace-nowrap sm:inline">
                {name}
              </span>
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-1 text-[12.5px] sm:text-[13px] font-semibold">
            <Link
              href="/login"
              className="focus-visible:ring-point text-secondary-foreground hover:bg-secondary rounded-md px-2 py-1.5 transition-colors outline-none focus-visible:ring-2"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="bg-point focus-visible:ring-point hover:bg-point-hover rounded-md px-2.5 py-1.5 text-white transition-colors outline-none focus-visible:ring-2"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
