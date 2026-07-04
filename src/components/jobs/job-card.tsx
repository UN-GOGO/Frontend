"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { type Opportunity } from "@/lib/api/iogo";
import { ddayChip, fitBadge, orgAbbrev } from "@/lib/opportunity";
import { cn } from "@/lib/utils";

/** 공고 목록·저장됨 화면에서 공유하는 공고 카드. */
export function JobCard({ job: o }: { job: Opportunity }) {
  if (!o) return null;
  const fit = o.score != null ? fitBadge(o.score) : null;
  const dday = ddayChip(o.deadline);

  return (
    <div className="bg-card border-border hover:border-point-border relative flex flex-col gap-3 rounded-2xl border p-[18px] transition-[box-shadow,border-color] hover:shadow-[0_8px_24px_rgba(31,58,138,0.08)]">
      {/* 카드 전체를 덮는 상세 링크 (stretched link) */}
      <Link href={`/jobs/${o.id}`} className="absolute inset-0 z-0 rounded-2xl">
        <span className="sr-only">{o.title} 상세 보기</span>
      </Link>

      {/* org + bookmark */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="bg-primary flex size-[38px] shrink-0 items-center justify-center rounded-[10px] text-[11px] font-extrabold text-white">
            {orgAbbrev(o.organization)}
          </div>
          <div className="min-w-0">
            <div className="text-muted-foreground truncate text-xs font-bold">
              {o.organization}
            </div>
            {o.location && (
              <div className="truncate text-[11px] text-slate-400">
                {o.location}
              </div>
            )}
          </div>
        </div>
        <BookmarkButton
          item={{ id: o.id, kind: "job", data: o }}
          className="-mt-1 -mr-1"
        />
      </div>

      {/* title + type tag */}
      <div>
        <div className="text-foreground text-base leading-snug font-extrabold tracking-tight">
          {o.title}
        </div>
        {o.type && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="bg-point-soft text-point-hover rounded-md px-2.5 py-1 text-[11px] font-bold">
              {o.type}
            </span>
          </div>
        )}
      </div>

      {o.description && (
        <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-600">
          {o.description}
        </p>
      )}

      {/* footer */}
      <div className="border-secondary mt-auto flex items-center justify-between gap-2.5 border-t pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {fit && (
            <span
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums",
                fit.cls,
              )}
            >
              {fit.pct}% 적합
            </span>
          )}
          {dday && (
            <span
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums",
                dday.cls,
              )}
            >
              {dday.label}
            </span>
          )}
        </div>
        <a
          href={o.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary border-border hover:border-point hover:text-point-hover relative z-10 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors"
        >
          지원하기
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
