"use client";

import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { type NewsArticle } from "@/lib/api/iogo";

/** 인사이트(추천 뉴스) 목록·저장됨 화면에서 공유하는 뉴스 카드. */
export function InsightCard({ article: a }: { article: NewsArticle }) {
  if (!a) return null;
  return (
    <div className="border-border bg-card hover:border-point-border rounded-[14px] border p-[18px] transition-colors">
      <div className="mb-2 flex items-center gap-2">
        <span className="bg-point-soft text-point-hover rounded-full px-2 py-0.5 text-[11px] font-bold">
          {a.source_name ?? a.source_api ?? "출처 미상"}
        </span>
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
    </div>
  );
}
