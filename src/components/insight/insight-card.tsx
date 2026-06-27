"use client";

import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { type PersonalizedInsightItem } from "@/lib/api/iogo";

/** 인사이트(추천 뉴스) 목록·저장됨 화면에서 공유하는 뉴스 카드.
 *  match_rate·reason은 개인화 응답에만 있어 선택적으로 렌더링한다. */
export function InsightCard({
  article: a,
}: {
  article: PersonalizedInsightItem;
}) {
  if (!a) return null;
  const matchPct =
    a.match_rate != null
      ? Math.round(a.match_rate <= 1 ? a.match_rate * 100 : a.match_rate)
      : null;
  return (
    <div className="border-border bg-card hover:border-point-border rounded-[14px] border p-[18px] transition-colors">
      <div className="mb-2 flex items-center gap-2">
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
        <BookmarkButton
          item={{ id: `insight:${a.id}`, kind: "insight", data: a }}
          className="-mt-1 ml-auto"
          iconClassName="size-[18px]"
        />
      </div>
      <div className="text-primary mb-[7px] text-base leading-snug font-extrabold tracking-tight text-balance">
        {a.source_url ? (
          <a
            href={a.source_url}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {a.title}
          </a>
        ) : (
          a.title
        )}
      </div>
      {(a.summary || a.content) && (
        <p className="text-muted-foreground line-clamp-2 text-[13px] leading-relaxed">
          {a.summary ?? a.content}
        </p>
      )}
      {a.reason && (
        <p className="text-point-hover mt-2 text-[12px] leading-relaxed">
          💡 {a.reason}
        </p>
      )}
    </div>
  );
}
