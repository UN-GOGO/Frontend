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
    <header className="bg-primary flex h-15 shrink-0 items-center justify-between px-5 text-white">
      {/* Logo + tagline */}
      <Link
        href="/compass"
        className="focus-visible:ring-point flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2"
      >
        <BrandMark />
        <span className="flex flex-col leading-[1.05]">
          <span className="text-[17px] font-extrabold tracking-tight">
            I-OGO
          </span>
          <span className="text-[10px] font-medium text-[#aeb8d4]">
            {t.tagline}
          </span>
        </span>
      </Link>

      <div className="flex items-center gap-3.5">
        {user ? (
          <>
            {/* Notifications */}
            <Link
              href="/notifications"
              aria-label={t.notifAria}
              className="focus-visible:ring-point relative flex size-8.5 items-center justify-center rounded-[9px] bg-white/10 transition-colors outline-none hover:bg-white/20 focus-visible:ring-2"
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
                <span className="border-primary bg-point absolute top-1.5 right-2 size-2 rounded-full border-[1.5px]" />
              )}
            </Link>

            {/* Avatar → mypage */}
            <Link
              href="/mypage"
              aria-label={t.mypageAria}
              className="focus-visible:ring-point flex items-center gap-2 rounded-md py-1 pr-2 pl-1 transition-colors outline-none hover:bg-white/10 focus-visible:ring-2"
            >
              <span className="bg-point-soft text-point-hover flex size-8 items-center justify-center rounded-full text-[13px] font-extrabold">
                {initial}
              </span>
              <span className="hidden text-[13px] font-semibold whitespace-nowrap text-[#dfe4f1] sm:inline">
                {name}
              </span>
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-1 text-[13px] font-semibold">
            <Link
              href="/login"
              className="focus-visible:ring-point rounded-md px-2.5 py-1.5 text-[#dfe4f1] transition-colors outline-none hover:bg-white/10 focus-visible:ring-2"
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
