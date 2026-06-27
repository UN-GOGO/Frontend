"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  ChevronRight,
  Compass,
  Newspaper,
} from "lucide-react";

import { ConnBadge, type ConnState } from "@/components/common/conn-badge";
import {
  getProfile,
  getUserStats,
  type Profile,
  type UserStats,
} from "@/lib/api/iogo";
import { getUserId } from "@/lib/api/user";
import {
  getNavigatorResults,
  type NavigatorResult,
} from "@/lib/compass/history";
import { useBookmarks } from "@/lib/bookmarks";

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-border bg-background min-w-[92px] rounded-xl border px-4 py-3 text-center">
      <div className="text-primary text-2xl leading-none font-extrabold tabular-nums">
        {value}
      </div>
      <div className="text-muted-foreground mt-1.5 text-[11px]">{label}</div>
    </div>
  );
}

export function MypageClient({ name, email }: { name: string; email: string }) {
  const [state, setState] = useState<ConnState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [navResults, setNavResults] = useState<NavigatorResult[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const userId = await getUserId();
        const [p, s, nav] = await Promise.allSettled([
          getProfile(userId, { signal: ctrl.signal }),
          getUserStats(userId, { signal: ctrl.signal }),
          getNavigatorResults(3),
        ]);
        if (p.status === "fulfilled") setProfile(p.value);
        if (s.status === "fulfilled") setStats(s.value);
        if (nav.status === "fulfilled") setNavResults(nav.value);
        setState("ok");
      } catch (e: unknown) {
        if (ctrl.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setState("error");
      }
    })();
    return () => ctrl.abort();
  }, []);

  const displayName = name || "사용자";
  const initial = (name || email || "U").charAt(0).toUpperCase();
  const subline =
    [profile?.major, profile?.education].filter(Boolean).join(" · ") ||
    email ||
    "프로필을 완성해 보세요.";

  const totalActivities = stats && stats.has_data ? stats.total_activities : 0;
  const keywordCount = stats && stats.has_data ? stats.top_keywords.length : 0;

  const { items: bookmarks } = useBookmarks();
  const savedJobs = bookmarks.filter((b) => b.kind === "job" && b.data);
  const savedInsights = bookmarks.filter((b) => b.kind === "insight" && b.data);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-8">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-primary text-2xl font-extrabold tracking-tight">
            마이페이지
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            프로필·알림·설정과 내 활동을 한곳에서 관리합니다.
          </p>
        </div>
        <ConnBadge state={state} error={error} />
      </div>

      {/* Profile header card */}
      <div className="border-border bg-card mb-6 flex flex-wrap items-center gap-5 rounded-[18px] border p-5">
        <span className="bg-point-soft text-point-hover flex size-14 shrink-0 items-center justify-center rounded-full text-2xl font-extrabold">
          {initial}
        </span>
        <div className="min-w-[140px] flex-1">
          <div className="text-foreground text-lg font-extrabold">
            {displayName}
          </div>
          <div className="text-muted-foreground mt-0.5 text-sm">{subline}</div>
        </div>
        <div className="flex gap-3">
          <StatCard value={String(totalActivities)} label="총 활동" />
          <StatCard value={String(keywordCount)} label="관심 키워드" />
        </div>
        <Link
          href="/profile"
          className="bg-primary hover:bg-point-hover shrink-0 rounded-[11px] px-4 py-2.5 text-[13px] font-bold text-white transition-colors"
        >
          프로필 수정
        </Link>
      </div>

      {/* 나침반 결과 */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-foreground flex items-center gap-2 text-[15px] font-extrabold">
            <Compass className="text-point-hover size-[18px]" />내 나침반 결과
          </h2>
          <Link
            href="/compass"
            className="text-point-hover text-xs font-bold hover:underline"
          >
            {navResults.length ? "다시 진단하기 →" : "진단하러 가기 →"}
          </Link>
        </div>

        {navResults.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-[14px] border border-dashed px-5 py-8 text-center text-sm">
            아직 나침반 진단 결과가 없어요.
            <br />
            <Link
              href="/compass"
              className="text-point-hover mt-1 inline-block text-xs font-bold hover:underline"
            >
              나에게 맞는 국제기구 찾기 →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {navResults.map((r) => (
              <NavResultCard key={r.id} result={r} />
            ))}
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {(
          [
            {
              href: "/notifications",
              icon: Bell,
              title: "알림 설정",
              desc: "구독·수신 채널을 관리해요.",
            },
            {
              href: "/saved?tab=job",
              icon: Briefcase,
              title: "저장된 공고",
              desc: `${savedJobs.length}개 저장됨`,
            },
            {
              href: "/saved?tab=insight",
              icon: Newspaper,
              title: "저장된 인사이트",
              desc: `${savedInsights.length}개 저장됨`,
            },
          ] as const
        ).map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="border-border bg-card hover:border-point-border flex items-center gap-3.5 rounded-[14px] border p-4 transition-colors hover:shadow-sm"
          >
            <span className="bg-point-soft text-point-hover flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-foreground text-[15px] font-extrabold">
                {title}
              </div>
              <div className="text-muted-foreground mt-0.5 text-xs">{desc}</div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-[#cbd5e1]" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function scoreClass(pct: number) {
  if (pct >= 85) return "bg-point text-white";
  if (pct >= 70) return "bg-point-soft text-point-hover";
  return "bg-secondary text-muted-foreground";
}

function NavResultCard({ result }: { result: NavigatorResult }) {
  const date = (() => {
    try {
      return new Date(result.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  })();
  const recs = result.recommendations.slice(0, 3);

  return (
    <Link
      href={`/compass/results/${result.id}`}
      className="border-border bg-card hover:border-point-border block rounded-[16px] border p-4 transition-colors hover:shadow-sm"
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-[11px] font-medium">
          {date}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="border-border text-muted-foreground rounded-full border bg-white px-2 py-0.5 text-[10px] font-semibold">
            {result.isAi ? "AI 분석" : "규칙기반"}
          </span>
          <ChevronRight className="size-4 text-[#cbd5e1]" />
        </div>
      </div>

      {result.needleLabel && (
        <p className="text-foreground mb-3 text-sm leading-snug font-extrabold text-balance">
          {result.needleLabel}
        </p>
      )}

      {recs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recs.map((r, i) => (
            <span
              key={i}
              className="border-border inline-flex items-center gap-1.5 rounded-full border bg-white py-1 pr-1 pl-2.5 text-[11px] font-semibold"
            >
              <span className="text-foreground/80 max-w-[180px] truncate">
                {r.org || r.abbr}
              </span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${scoreClass(r.score ?? 0)}`}
              >
                {r.score}%
              </span>
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
