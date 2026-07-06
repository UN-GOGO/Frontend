"use client";

import { useState } from "react";
import { ExternalLink, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { type PersonalizedInsightItem } from "@/lib/api/iogo";

/** 인사이트(추천 뉴스) 목록·저장됨 화면에서 공유하는 뉴스 카드.
 *  match_score·match_reasons는 개인화 응답에만 있어 선택적으로 렌더링한다. */
export function InsightCard({
  article: a,
}: {
  article: PersonalizedInsightItem;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!a) return null;
  const matchPct =
    a.match_score != null && a.match_score > 0
      ? Math.round(a.match_score <= 1 ? a.match_score * 100 : a.match_score)
      : null;
  return (
    <div className="border-border bg-card hover:border-point-border group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[14px] border transition-all hover:-translate-y-0.5 hover:shadow-md">
      {a.source_url && (
        <a
          href={a.source_url}
          target="_blank"
          rel="noreferrer"
          className="absolute inset-0 z-10"
          aria-label={`${a.title} (새 창으로 열기)`}
        />
      )}

      <div className="bg-muted relative aspect-[16/9] w-full shrink-0 overflow-hidden">
        <img
          src={a.thumbnail_url || "/insight_default_earth.jpg"}
          alt={a.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-[18px]">
        {/* Top: Title + Bookmark */}
        <div className="mb-2 flex items-start gap-2">
          <div className="text-primary group-hover:text-point-hover flex-1 text-base leading-snug font-extrabold tracking-tight text-balance transition-colors">
            <span className="line-clamp-2">{a.title}</span>
          </div>
          <div className="relative z-20 ml-1 shrink-0">
            <BookmarkButton
              item={{ id: `insight:${a.id}`, kind: "insight", data: a }}
              iconClassName="size-[18px]"
            />
          </div>
        </div>

        {/* Middle: Content & Reasons */}
        <div className="mb-auto">
          {a.content && (
            <p className="text-muted-foreground line-clamp-2 text-[13px] leading-relaxed">
              {a.content}
            </p>
          )}
          {a.match_reasons && a.match_reasons.length > 0 && (
            <p className="text-point-hover mt-3 text-[12px] leading-relaxed">
              💡 {a.match_reasons.join(" · ")}
            </p>
          )}
        </div>

        {/* One-line Summary (Collapsible YouTube Sparkles style) */}
        {a.summary && (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="bg-secondary hover:bg-secondary/80 dark:bg-muted/30 dark:hover:bg-muted/50 relative z-20 mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-[12px] leading-relaxed transition-all select-none"
          >
            <div
              className={`flex-1 font-medium text-slate-600 dark:text-slate-300 ${isExpanded ? "" : "line-clamp-1"}`}
            >
              {a.summary}
            </div>
            <div className="flex shrink-0 items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
              <Sparkles className="text-point-hover fill-point-soft size-3.5" />
              <span className="text-[11px] font-extrabold tracking-tight">
                요약
              </span>
              {isExpanded ? (
                <ChevronUp className="size-3.5 opacity-70" />
              ) : (
                <ChevronDown className="size-3.5 opacity-70" />
              )}
            </div>
          </div>
        )}

        {/* Bottom: Source Info & External Icon */}
        <div className="border-border/50 mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-point-soft text-point-hover rounded-full px-2 py-0.5 text-[11px] font-bold">
              {a.source_name ?? a.source_api ?? "출처 미상"}
            </span>
            {matchPct != null && (
              <span className="bg-primary rounded-full px-2 py-0.5 text-[11px] font-extrabold text-white tabular-nums">
                매칭 {matchPct}%
              </span>
            )}
            {a.published_at && (
              <span className="text-muted-foreground font-mono text-[12px]">
                {a.published_at.slice(0, 10)}
              </span>
            )}
          </div>
          {a.source_url && (
            <ExternalLink className="ml-2 size-[15px] shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>
    </div>
  );
}
