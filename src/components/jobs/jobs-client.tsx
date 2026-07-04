"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ConnBadge, type ConnState } from "@/components/common/conn-badge";
import { JobCard } from "@/components/jobs/job-card";
import { JobCardSkeletonGrid } from "@/components/jobs/job-card-skeleton";
import {
  getOpportunities,
  getPersonalizedOpportunities,
  logSearch,
  type Opportunity,
} from "@/lib/api/iogo";
import { getUserId } from "@/lib/api/user";
import { cn } from "@/lib/utils";

type SortKey = "fit" | "dday";

const PAGE_SIZE = 9;

export function JobsClient() {
  const [state, setState] = useState<ConnState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>("all");
  const [activeOrg, setActiveOrg] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("fit");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const uid = await getUserId();
        setUserId(uid);
        // 개인화 공고 우선 시도. 나침반 미완료(has_compass=false)거나
        // 결과가 비면 일반 공고 목록으로 폴백한다.
        const p = await getPersonalizedOpportunities(uid, {
          signal: ctrl.signal,
        });
        if (p.has_compass && p.items.length > 0) {
          setItems(p.items);
          setPersonalized(true);
        } else {
          const all = await getOpportunities(
            { limit: 100 },
            { signal: ctrl.signal },
          );
          setItems(all);
        }
        setState("ok");
      } catch (e: unknown) {
        if (ctrl.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setState("error");
      }
    })();
    return () => ctrl.abort();
  }, []);

  // 데이터에 실제로 존재하는 type 값으로만 필터 칩을 구성한다.
  const types = useMemo(
    () => Array.from(new Set(items.map((o) => o.type).filter(Boolean))),
    [items],
  );

  // 데이터에 존재하는 기관 목록 (가나다순).
  const orgs = useMemo(
    () =>
      Array.from(
        new Set(items.map((o) => o.organization).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "ko")),
    [items],
  );

  const visible = useMemo(() => {
    const filtered = items.filter(
      (o) =>
        (activeType === "all" || o.type === activeType) &&
        (activeOrg === "all" || o.organization === activeOrg),
    );
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "fit") return (b.score ?? -1) - (a.score ?? -1);
      const ta = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const tb = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return ta - tb;
    });
    return sorted;
  }, [items, activeType, activeOrg, sort]);

  // 필터·정렬을 바꿀 때는 첫 페이지로 되돌린다.
  const selectType = (t: string) => {
    setActiveType(t);
    setPage(1);
  };
  const selectOrg = (o: string) => {
    setActiveOrg(o);
    setPage(1);
    // 기구 필터 선택을 검색 신호로 기록 (개인화 입력). 실패는 무시.
    if (o !== "all" && userId) {
      void logSearch(userId, o).catch(() => {});
    }
  };
  const selectSort = (s: SortKey) => {
    setSort(s);
    setPage(1);
  };

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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
              ? `${visible.length}개의 공고${personalized ? " · 맞춤 정렬" : ""}`
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
            onClick={() => selectType("all")}
          />
          {types.map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={activeType === t}
              onClick={() => selectType(t)}
            />
          ))}

          {orgs.length > 1 && (
            <select
              value={activeOrg}
              onChange={(e) => selectOrg(e.target.value)}
              aria-label="국제기구 필터"
              className={cn(
                "ml-1 rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-colors outline-none",
                activeOrg === "all"
                  ? "border-border bg-card text-muted-foreground hover:border-point"
                  : "border-point bg-point-soft text-point-hover",
              )}
            >
              <option value="all">전체 기구</option>
              {orgs.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}

          <div className="border-border bg-card ml-auto flex gap-1.5 rounded-[9px] border p-[3px]">
            <SortButton
              label="적합도순"
              active={sort === "fit"}
              onClick={() => selectSort("fit")}
            />
            <SortButton
              label="마감임박순"
              active={sort === "dday"}
              onClick={() => selectSort("dday")}
            />
          </div>
        </div>
      )}

      {/* ── States ── */}
      {state === "loading" && <JobCardSkeletonGrid />}
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
        {paged.map((o) => (
          <JobCard key={o.id} job={o} />
        ))}
      </div>

      {/* ── Pagination ── */}
      {state === "ok" && pageCount > 1 && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          onChange={setPage}
        />
      )}

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

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (next: number) => void;
}) {
  const go = (next: number) => {
    onChange(Math.min(Math.max(1, next), pageCount));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav
      aria-label="공고 페이지"
      className="mt-8 flex items-center justify-center gap-1.5"
    >
      <PagerArrow
        label="이전 페이지"
        disabled={page === 1}
        onClick={() => go(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </PagerArrow>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? "page" : undefined}
          onClick={() => go(p)}
          className={cn(
            "h-9 min-w-9 rounded-[10px] px-2 text-sm font-bold tabular-nums transition-colors",
            p === page
              ? "bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-point hover:text-point-hover border",
          )}
        >
          {p}
        </button>
      ))}

      <PagerArrow
        label="다음 페이지"
        disabled={page === pageCount}
        onClick={() => go(page + 1)}
      >
        <ChevronRight className="size-4" />
      </PagerArrow>
    </nav>
  );
}

function PagerArrow({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="border-border bg-card text-muted-foreground hover:border-point hover:text-point-hover flex size-9 items-center justify-center rounded-[10px] border transition-colors disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
