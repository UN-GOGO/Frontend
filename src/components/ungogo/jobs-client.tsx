"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BookmarkButton } from "./bookmark-button";
import { ConnBadge, type ConnState } from "./conn-badge";
import { getOpportunities, type Opportunity } from "@/lib/api/ungogo";
import { ddayChip, fitBadge, orgAbbrev } from "@/lib/opportunity";
import { cn } from "@/lib/utils";

type SortKey = "fit" | "dday";

export function JobsClient() {
  const [state, setState] = useState<ConnState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [activeType, setActiveType] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("fit");

  useEffect(() => {
    const ctrl = new AbortController();
    getOpportunities({ limit: 20 }, { signal: ctrl.signal })
      .then((data) => {
        setItems(data);
        setState("ok");
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setState("error");
      });
    return () => ctrl.abort();
  }, []);

  // 데이터에 실제로 존재하는 type 값으로만 필터 칩을 구성한다.
  const types = useMemo(
    () => Array.from(new Set(items.map((o) => o.type).filter(Boolean))),
    [items],
  );

  const visible = useMemo(() => {
    const filtered =
      activeType === "all" ? items : items.filter((o) => o.type === activeType);
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "fit") return (b.score ?? -1) - (a.score ?? -1);
      const ta = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const tb = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return ta - tb;
    });
    return sorted;
  }, [items, activeType, sort]);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-7">
      {/* ── Header ── */}
      <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
            공고 탐색
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {state === "ok"
              ? `${visible.length}개의 공고`
              : "외교부 공공데이터 기반 국제기구 공고"}
          </p>
        </div>
        <ConnBadge state={state} error={error} />
      </div>

      {/* ── Filters + sort ── */}
      {state === "ok" && items.length > 0 && (
        <div className="my-4 flex flex-wrap items-center gap-2.5">
          <FilterChip
            label="전체"
            active={activeType === "all"}
            onClick={() => setActiveType("all")}
          />
          {types.map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={activeType === t}
              onClick={() => setActiveType(t)}
            />
          ))}
          <div className="border-border bg-card ml-auto flex gap-1.5 rounded-[9px] border p-[3px]">
            <SortButton
              label="적합도순"
              active={sort === "fit"}
              onClick={() => setSort("fit")}
            />
            <SortButton
              label="마감임박순"
              active={sort === "dday"}
              onClick={() => setSort("dday")}
            />
          </div>
        </div>
      )}

      {/* ── States ── */}
      {state === "loading" && (
        <p className="text-muted-foreground mt-6 text-sm">
          공고를 불러오는 중…
        </p>
      )}
      {state === "ok" && items.length === 0 && (
        <div className="text-muted-foreground py-[70px] text-center">
          <p className="text-foreground text-[15px] font-bold">
            표시할 공고가 없어요
          </p>
          <p className="mt-1.5 text-sm">
            연결은 됐지만 공고 데이터가 비어 있습니다 (DB 시드 필요).
          </p>
        </div>
      )}
      {state === "ok" && items.length > 0 && visible.length === 0 && (
        <div className="text-muted-foreground py-[70px] text-center">
          <p className="text-foreground text-[15px] font-bold">
            조건에 맞는 공고가 없어요
          </p>
        </div>
      )}

      {/* ── Cards ── */}
      <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(312px,1fr))] gap-4">
        {visible.map((o) => {
          const fit = o.score != null ? fitBadge(o.score) : null;
          const dday = ddayChip(o.deadline);
          return (
            <div
              key={o.id}
              className="bg-card border-border hover:border-point-border relative flex flex-col gap-3 rounded-2xl border p-[18px] transition-[box-shadow,border-color] hover:shadow-[0_8px_24px_rgba(45,63,102,0.08)]"
            >
              {/* 카드 전체를 덮는 상세 링크 (stretched link) */}
              <Link
                href={`/jobs/${o.id}`}
                className="absolute inset-0 z-0 rounded-2xl"
              >
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
                <BookmarkButton id={o.id} className="-mt-1 -mr-1" />
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
        })}
      </div>

      {state === "error" && (
        <p className="text-muted-foreground mt-4 text-xs">
          백엔드를 <code>localhost:8000</code> 에서 실행했는지, 그리고
          <code> ALLOWED_ORIGINS</code> 에 이 앱 주소가 포함됐는지 확인하세요.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-[13px] font-bold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-point hover:text-point-hover border",
      )}
    >
      {label}
    </button>
  );
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-bold transition-colors",
        active
          ? "bg-point-soft text-point-hover"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
