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
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProfile,
  getUserStats,
  type Profile,
  type UserStats,
} from "@/lib/api/iogo";
import { getUserId } from "@/lib/api/user";
import { useBookmarks } from "@/lib/bookmarks";

// 관심 기구 비율 그래프·범례 색상 — 기구 순서대로 순환
const STAT_COLORS = [
  "bg-primary",
  "bg-blue-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-purple-400",
  "bg-rose-400",
];

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
  // 통계 전용 로딩/에러 — 프로필 응답이 늦어도 "내 관심사 통계"는
  // 자기 데이터가 도착하는 즉시 스켈레톤을 벗는다(전체 state에 묶지 않음).
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsRetryKey, setStatsRetryKey] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const userId = await getUserId();

        setStatsLoading(true);
        setStatsError(null);
        const statsPromise = getUserStats(userId, { signal: ctrl.signal })
          .then((s) => setStats(s))
          .catch((e: unknown) => {
            if (ctrl.signal.aborted) return;
            console.error("관심사 통계 조회 실패:", e);
            setStatsError(e instanceof Error ? e.message : String(e));
          })
          .finally(() => {
            if (!ctrl.signal.aborted) setStatsLoading(false);
          });

        const profilePromise = getProfile(userId, { signal: ctrl.signal })
          .then((p) => setProfile(p))
          .catch((e: unknown) => {
            if (ctrl.signal.aborted) return;
            console.error("프로필 조회 실패:", e);
          });

        await Promise.allSettled([profilePromise, statsPromise]);
        setState("ok");
      } catch (e: unknown) {
        if (ctrl.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setState("error");
      }
    })();
    return () => ctrl.abort();
  }, [statsRetryKey]);

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

      {/* Menu */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {(
          [
            {
              href: "/compass/results",
              icon: Compass,
              title: "나침반 결과",
              desc: "최신 진단 결과를 확인해요.",
            },
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

      {/* 관심사 통계 */}
      <div className="mt-8">
        <h2 className="text-foreground mb-4 text-lg font-bold">
          내 관심사 통계
        </h2>

        {!stats && statsLoading && (
          <div className="border-border bg-card flex flex-col gap-6 rounded-[18px] border p-5 sm:p-6">
            <div>
              <Skeleton className="mb-3 h-5 w-28" />
              <Skeleton className="h-3.5 w-full rounded-full" />
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
            <hr className="border-border" />
            <div>
              <Skeleton className="mb-3 h-5 w-32" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {!stats && !statsLoading && statsError && (
          <div className="border-border bg-card flex flex-col items-start gap-2 rounded-[18px] border p-5 text-sm sm:p-6">
            <p className="text-muted-foreground">
              통계를 불러오지 못했어요. {statsError}
            </p>
            <button
              type="button"
              onClick={() => setStatsRetryKey((k) => k + 1)}
              className="text-point-hover font-semibold hover:underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {stats && !stats.has_data && (
          <p className="text-muted-foreground text-sm">{stats.message}</p>
        )}

        {stats && stats.has_data && (
          <div className="border-border bg-card flex flex-col gap-6 rounded-[18px] border p-5 sm:p-6">
            <div>
              <p className="text-foreground mb-3 text-[15px] font-bold">
                관심 기구 비율
              </p>
              {/* Single Combined Graph */}
              <div className="bg-muted flex h-3.5 w-full overflow-hidden rounded-full">
                {stats.organization_ratio.map((o, i) => {
                  const color = STAT_COLORS[i % STAT_COLORS.length];
                  return (
                    <div
                      key={o.name}
                      className={`h-full ${color} transition-all duration-500`}
                      style={{ width: `${o.percentage}%` }}
                      title={`${o.name} ${o.percentage}%`}
                    />
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
                {stats.organization_ratio.map((o, i) => {
                  const color = STAT_COLORS[i % STAT_COLORS.length];
                  return (
                    <div
                      key={o.name}
                      className="flex items-center gap-2 text-[13px]"
                    >
                      <span
                        className={`size-3 shrink-0 rounded-full ${color}`}
                      />
                      <span className="text-foreground font-semibold">
                        {o.name}
                      </span>
                      <span className="text-muted-foreground">
                        {o.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {stats.top_keywords.length > 0 && (
              <>
                <hr className="border-border" />
                <div>
                  <p className="text-foreground mb-3 text-[15px] font-bold">
                    자주 찾은 키워드
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stats.top_keywords.map((k) => (
                      <span
                        key={k.keyword}
                        className="bg-muted text-foreground rounded-lg px-3 py-1.5 text-[13px] font-medium"
                      >
                        {k.keyword}{" "}
                        <span className="text-muted-foreground ml-1">
                          {k.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
