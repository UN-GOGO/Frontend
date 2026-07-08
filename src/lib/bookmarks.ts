"use client";

// 북마크(공고·인사이트) 스토어.
// 저장소: 로그인 유저는 Supabase(public.bookmarks)에 영구 저장하고,
//   비로그인(연결 테스트) 상태에서는 localStorage에만 보관한다.
// localStorage는 즉시 렌더용 캐시 + 비로그인 폴백으로 계속 사용한다.
// data(Opportunity / NewsArticle)를 통째로 저장해, 마이페이지·저장됨 화면에서
// 실제 공고/인사이트 레이아웃 그대로 보여준다.

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import {
  normalizeOpportunity,
  type NewsArticle,
  type Opportunity,
} from "@/lib/api/iogo";
import { createClient } from "@/lib/supabase/client";

export type BookmarkKind = "job" | "insight";

export type BookmarkItem =
  | { id: string; kind: "job"; savedAt?: number; data: Opportunity }
  | { id: string; kind: "insight"; savedAt?: number; data: NewsArticle };

const KEY = "iogo.bookmarks.v1";
const LEGACY_KEY = "polaris.bookmarks.v3";
const EMPTY: BookmarkItem[] = [];

const listeners = new Set<() => void>();
let cache: BookmarkItem[] | null = null;

function normalizeBookmarkItem(item: BookmarkItem): BookmarkItem {
  if (item.kind !== "job") return item;
  return {
    ...item,
    data: normalizeOpportunity(item.data),
  };
}

function read(): BookmarkItem[] {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    let raw = window.localStorage.getItem(KEY);
    // 레거시 키(polaris.bookmarks.v3)에서 1회 마이그레이션 — 기존 저장 데이터 보존
    if (!raw) {
      const legacy = window.localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        window.localStorage.setItem(KEY, legacy);
        window.localStorage.removeItem(LEGACY_KEY);
        raw = legacy;
      }
    }
    cache = raw
      ? (JSON.parse(raw) as BookmarkItem[]).map(normalizeBookmarkItem)
      : [];
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

// ===== Supabase 동기화 =====

type BookmarkRow = {
  kind: BookmarkKind;
  item_id: string;
  data: BookmarkItem["data"];
  created_at: string | null;
};

async function getUid(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

let hydrated = false;

/**
 * 로그인 유저면 Supabase에서 북마크를 불러와 스토어를 채운다.
 * 로그인 전 localStorage에만 있던 항목은 DB로 1회 이관(merge)한다.
 * 비로그인 상태면 아무 것도 하지 않고 localStorage만 쓴다.
 */
async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const uid = await getUid();
    if (!uid) return; // 비로그인 → localStorage만 사용

    const supabase = createClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("kind,item_id,data,created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error || !data) return;

    const serverItems = (data as BookmarkRow[]).map((r) =>
      normalizeBookmarkItem({
        id: r.item_id,
        kind: r.kind,
        savedAt: r.created_at ? new Date(r.created_at).getTime() : undefined,
        data: r.data,
      } as BookmarkItem),
    );

    // 로그인 전 localStorage에만 있던 항목 → DB로 이관
    const serverIds = new Set(serverItems.map((b) => b.id));
    const localOnly = read().filter((b) => !serverIds.has(b.id));
    if (localOnly.length) {
      await supabase.from("bookmarks").upsert(
        localOnly.map((b) => ({
          user_id: uid,
          kind: b.kind,
          item_id: b.id,
          data: b.data,
        })),
        { onConflict: "user_id,kind,item_id" },
      );
    }

    write([...localOnly, ...serverItems]);
  } catch {
    // 동기화 실패는 조용히 무시 — localStorage 캐시로 계속 동작
  }
}

async function persistToggle(item: BookmarkItem, add: boolean) {
  try {
    const uid = await getUid();
    if (!uid) return; // 비로그인 → localStorage만
    const supabase = createClient();
    if (add) {
      await supabase.from("bookmarks").upsert(
        {
          user_id: uid,
          kind: item.kind,
          item_id: item.id,
          data: item.data,
        },
        { onConflict: "user_id,kind,item_id" },
      );
    } else {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", uid)
        .eq("kind", item.kind)
        .eq("item_id", item.id);
    }
  } catch {
    // 영구 저장 실패는 조용히 무시 — UI/localStorage엔 이미 반영됨
  }
}

function toggleItem(item: BookmarkItem) {
  item = normalizeBookmarkItem(item);
  const cur = read();
  const exists = cur.some((b) => b.id === item.id);
  // 1) 낙관적 업데이트(즉시 UI 반영 + localStorage)
  if (exists) {
    write(cur.filter((b) => b.id !== item.id));
  } else {
    write([{ ...item, savedAt: Date.now() }, ...cur]);
  }
  // 2) DB 영구 저장(베스트 에포트)
  void persistToggle(item, !exists);
}

export function useBookmarks() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  useEffect(() => {
    void hydrate();
  }, []);
  const set = useMemo(() => new Set(items.map((b) => b.id)), [items]);
  const isBookmarked = useCallback((id: string) => set.has(id), [set]);
  return { items, count: set.size, isBookmarked, toggle: toggleItem };
}
