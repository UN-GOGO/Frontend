"use client";

// 공고 북마크를 localStorage에 저장하는 작은 외부 스토어.
// 백엔드에 저장 엔드포인트가 없으므로 클라이언트(이 브라우저)에만 보관한다.

import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "polaris.bookmarks.v1";
const EMPTY: string[] = [];

const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(ids: string[]) {
  cache = ids;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(ids));
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

function toggleId(id: string) {
  const cur = read();
  write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
}

export function useBookmarks() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  const set = useMemo(() => new Set(ids), [ids]);
  const isBookmarked = useCallback((id: string) => set.has(id), [set]);
  const toggle = useCallback((id: string) => toggleId(id), []);
  return { ids, set, count: set.size, isBookmarked, toggle };
}
