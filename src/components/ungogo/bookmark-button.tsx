"use client";

import { Bookmark } from "lucide-react";

import { useBookmarks, type BookmarkItem } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";

/** 공고·인사이트 카드/상세에서 쓰는 북마크 토글 버튼. */
export function BookmarkButton({
  item,
  className,
  iconClassName,
}: {
  item: BookmarkItem;
  className?: string;
  iconClassName?: string;
}) {
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(item.id);

  return (
    <button
      type="button"
      aria-label={saved ? "북마크 해제" : "북마크"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center justify-center rounded-lg p-1 transition-colors",
        saved ? "text-point" : "hover:text-point text-slate-300",
        className,
      )}
    >
      <Bookmark
        className={cn("size-5", saved && "fill-current", iconClassName)}
      />
    </button>
  );
}
