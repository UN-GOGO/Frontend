"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { InsightCard } from "@/components/insight/insight-card";
import { JobCard } from "@/components/jobs/job-card";
import { useBookmarks, type BookmarkKind } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";

export function SavedClient({ initialTab }: { initialTab: BookmarkKind }) {
  const { items } = useBookmarks();
  const [tab, setTab] = useState<BookmarkKind>(initialTab);

  // data가 없는 (구버전·손상된) 항목은 카드를 못 그리므로 제외한다.
  // kind 필터를 먼저 분리해야 타입이 좁혀져 카드 prop에 그대로 넘길 수 있다.
  const jobs = items.filter((b) => b.kind === "job").filter((b) => b.data);
  const insights = items
    .filter((b) => b.kind === "insight")
    .filter((b) => b.data);

  const TABS: { key: BookmarkKind; label: string; count: number }[] = [
    { key: "job", label: "저장된 공고", count: jobs.length },
    { key: "insight", label: "저장된 인사이트", count: insights.length },
  ];

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-8">
      <Link
        href="/mypage"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
      >
        <ChevronLeft className="size-4" />
        마이페이지
      </Link>

      <h1 className="text-primary mb-4 text-2xl font-extrabold tracking-tight">
        저장됨
      </h1>

      {/* Tabs */}
      <div className="bg-muted mb-5 flex max-w-[420px] gap-1 rounded-xl p-1">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors",
              tab === key
                ? "bg-card text-point-hover shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            <span className="ml-1.5 text-xs tabular-nums">{count}</span>
          </button>
        ))}
      </div>

      {/* Job list — 공고 레이아웃 그대로 */}
      {tab === "job" &&
        (jobs.length === 0 ? (
          <EmptyState kind="job" />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(312px,1fr))] gap-4">
            {jobs.map((b) => (
              <JobCard key={b.id} job={b.data} />
            ))}
          </div>
        ))}

      {/* Insight list — 인사이트 레이아웃 그대로 */}
      {tab === "insight" &&
        (insights.length === 0 ? (
          <EmptyState kind="insight" />
        ) : (
          <div className="flex max-w-[760px] flex-col gap-3">
            {insights.map((b) => (
              <InsightCard key={b.id} article={b.data} />
            ))}
          </div>
        ))}
    </div>
  );
}

function EmptyState({ kind }: { kind: BookmarkKind }) {
  const label = kind === "job" ? "공고" : "인사이트";
  return (
    <div className="border-border text-muted-foreground rounded-[14px] border border-dashed px-5 py-12 text-center text-sm">
      아직 저장한 {label}가 없어요.
      <br />
      <Link
        href={kind === "job" ? "/jobs" : "/insight"}
        className="text-point-hover mt-1 inline-block text-xs font-bold hover:underline"
      >
        {label} 보러 가기 →
      </Link>
    </div>
  );
}
