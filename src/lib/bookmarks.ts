"use client";

// 북마크(공고·인사이트)를 localStorage에 저장하는 작은 외부 스토어.
// 백엔드에 저장 엔드포인트가 없으므로 클라이언트(이 브라우저)에만 보관한다.
// v3부터는 카드 렌더에 필요한 원본 데이터(Opportunity / NewsArticle)를 통째로
// 저장해, 마이페이지·저장됨 화면에서 실제 공고/인사이트 레이아웃 그대로 보여준다.

import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { NewsArticle, Opportunity } from "@/lib/api/ungogo";

export type BookmarkKind = "job" | "insight";

export type BookmarkItem =
  | { id: string; kind: "job"; savedAt?: number; data: Opportunity }
  | { id: string; kind: "insight"; savedAt?: number; data: NewsArticle };

const KEY = "polaris.bookmarks.v3";
const EMPTY: BookmarkItem[] = [];

const listeners = new Set<() => void>();
let cache: BookmarkItem[] | null = null;

function read(): BookmarkItem[] {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as BookmarkItem[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: BookmarkItem[]) {
  cache = items;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // 저장 실패는 조용히 무시 (시크릿 모드 등)
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null; // 다른 탭의 변경 → 캐시 무효화
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function toggleItem(item: BookmarkItem) {
  const cur = read();
  if (cur.some((b) => b.id === item.id)) {
    write(cur.filter((b) => b.id !== item.id));
  } else {
    write([{ ...item, savedAt: Date.now() }, ...cur]);
  }
}

export function useBookmarks() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const set = useMemo(() => new Set(items.map((b) => b.id)), [items]);
  const isBookmarked = useCallback((id: string) => set.has(id), [set]);
  const toggle = useCallback((item: BookmarkItem) => toggleItem(item), []);
  return { items, count: set.size, isBookmarked, toggle };
}
