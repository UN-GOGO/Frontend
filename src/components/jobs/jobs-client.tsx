"use client";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { MouseEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { type ConnState } from "@/components/common/conn-badge";
import { JobCard } from "@/components/jobs/job-card";
import { JobCardSkeletonGrid } from "@/components/jobs/job-card-skeleton";
import {
  getMatchedOpportunities,
  getOpportunities,
  getPersonalizedOpportunities,
  type Opportunity,
  type PersonalizedOpportunities,
} from "@/lib/api/iogo";
import { getUserId } from "@/lib/api/user";
import {
  getLatestNavigatorResult,
  type NavigatorResultDetail,
} from "@/lib/compass/history";
import { cn } from "@/lib/utils";

type SortKey = "latest" | "deadline";
type TabKey = "all" | "JPO" | "internship" | "program";
type PersonalizedItem = PersonalizedOpportunities["items"][number];

const PAGE_SIZE = 9;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "JPO", label: "JPO" },
  { key: "internship", label: "인턴십" },
  { key: "program", label: "기구" },
];

export function JobsClient() {
  const [state, setState] = useState<ConnState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [personalizedData, setPersonalizedData] =
    useState<PersonalizedOpportunities | null>(null);
  const [compassResult, setCompassResult] =
    useState<NavigatorResultDetail | null>(null);
  const [allItems, setAllItems] = useState<Opportunity[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sort, setSort] = useState<SortKey>("latest");
  const [page, setPage] = useState(1);
  const [referenceTime, setReferenceTime] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselDragRef = useRef({
    isDown: false,
    moved: false,
    pointerId: -1,
    scrollLeft: 0,
    startX: 0,
  });
  const [isCarouselDragging, setIsCarouselDragging] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const uid = await getUserId();
        const [personalized, all, compass] = await Promise.all([
          getPersonalizedOpportunities(uid, { signal: ctrl.signal }).catch(
            (): PersonalizedOpportunities => ({
              has_compass: false,
              items: [],
            }),
          ),
          getMatchedOpportunities(uid, 100, { signal: ctrl.signal })
            .then((items) =>
              items.length > 0
                ? items
                : getOpportunities({ limit: 100 }, { signal: ctrl.signal }),
            )
            .catch(() =>
              getOpportunities({ limit: 100 }, { signal: ctrl.signal }),
            ),
          getLatestNavigatorResult().catch(() => null),
        ]);
        setPersonalizedData(personalized);
        setCompassResult(compass);
        setAllItems(all);
        setReferenceTime(Date.now());
        setState("ok");
      } catch (e: unknown) {
        if (ctrl.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setState("error");
      }
    })();
    return () => ctrl.abort();
  }, []);

  // 캐러셀: 직접 매칭 공고 우선. 없으면 나침반 기반 후보를 유지해 섹션이 사라지지 않게 한다.
  const carouselItems = useMemo(() => {
    const hasCompass = Boolean(personalizedData?.has_compass || compassResult);
    if (!hasCompass) return [];
    const today = referenceTime || 0;
    const sortForCarousel = (items: PersonalizedItem[]) =>
      [...items].sort((a, b) => {
        const da = a.deadline
          ? new Date(a.deadline).getTime() - today
          : Infinity;
        const db = b.deadline
          ? new Date(b.deadline).getTime() - today
          : Infinity;
        // 마감 지난 공고(음수)는 뒤로
        const urgentA = da >= 0 ? da : Infinity;
        const urgentB = db >= 0 ? db : Infinity;
        if (urgentA !== urgentB) return urgentA - urgentB;
        return (b.match_score ?? 0) - (a.match_score ?? 0);
      });

    const personalizedItems = personalizedData?.items ?? [];
    const directMatches = personalizedItems.filter(
      (o) => (o.match_score ?? 0) > 0,
    );
    if (directMatches.length > 0 || personalizedItems.length > 0) {
      return sortForCarousel(
        directMatches.length > 0 ? directMatches : personalizedItems,
      ).slice(0, 10);
    }

    const recommendedAbbrs = (compassResult?.recommendations ?? [])
      .map((r) => r.abbr.trim().toUpperCase())
      .filter(Boolean);
    const recommended = allItems.filter((item) => {
      const haystack =
        `${item.organization} ${item.title} ${item.description ?? ""}`.toUpperCase();
      return recommendedAbbrs.some((abbr) => haystack.includes(abbr));
    });

    return sortForCarousel(
      recommended.length > 0 ? recommended : allItems,
    ).slice(0, 10);
  }, [allItems, compassResult, personalizedData, referenceTime]);

  // LLM 요약 — 백엔드가 반환한 summary 우선, 없으면 기본 문구
  const summaryText =
    personalizedData?.summary ||
    (carouselItems.length
      ? `나침반 결과 기반 맞춤 공고 ${carouselItems.length}개`
      : "");

  // 탭 + 정렬 필터링
  const visible = useMemo(() => {
    const filtered =
      activeTab === "all"
        ? allItems
        : activeTab === "program"
          ? allItems.filter((o) => o.type === "program" || o.type === "UNV")
          : allItems.filter((o) => o.type === activeTab);

    return [...filtered].sort((a, b) => {
      if (sort === "latest") {
        // 실제 게시일(posted_at) 우선, 없으면 수집일(fetched_at) 폴백
        const ta = a.posted_at
          ? new Date(a.posted_at).getTime()
          : a.fetched_at
            ? new Date(a.fetched_at).getTime()
            : 0;
        const tb = b.posted_at
          ? new Date(b.posted_at).getTime()
          : b.fetched_at
            ? new Date(b.fetched_at).getTime()
            : 0;
        return tb - ta;
      }
      const ta = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const tb = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return ta - tb;
    });
  }, [allItems, activeTab, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const selectTab = (t: TabKey) => {
    setActiveTab(t);
    setPage(1);
  };
  const selectSort = (s: SortKey) => {
    setSort(s);
    setPage(1);
  };

  const scrollCarousel = (dir: "prev" | "next") => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "next" ? 316 : -316, behavior: "smooth" });
  };

  const startCarouselDrag = (ev: PointerEvent<HTMLDivElement>) => {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    const el = carouselRef.current;
    if (!el) return;

    carouselDragRef.current = {
      isDown: true,
      moved: false,
      pointerId: ev.pointerId,
      scrollLeft: el.scrollLeft,
      startX: ev.clientX,
    };
    setIsCarouselDragging(true);
    el.setPointerCapture(ev.pointerId);
  };

  const moveCarouselDrag = (ev: PointerEvent<HTMLDivElement>) => {
    const drag = carouselDragRef.current;
    const el = carouselRef.current;
    if (!drag.isDown || !el) return;

    const deltaX = ev.clientX - drag.startX;
    if (Math.abs(deltaX) > 4) {
      drag.moved = true;
      ev.preventDefault();
    }
    el.scrollLeft = drag.scrollLeft - deltaX;
  };

  const endCarouselDrag = (ev: PointerEvent<HTMLDivElement>) => {
    const drag = carouselDragRef.current;
    const el = carouselRef.current;
    if (!drag.isDown || !el) return;

    drag.isDown = false;
    setIsCarouselDragging(false);
    if (el.hasPointerCapture(ev.pointerId)) {
      el.releasePointerCapture(ev.pointerId);
    }
  };

  const suppressClickAfterDrag = (ev: MouseEvent<HTMLDivElement>) => {
    if (!carouselDragRef.current.moved) return;
    ev.preventDefault();
    ev.stopPropagation();
    carouselDragRef.current.moved = false;
  };

  const showCarousel = state === "ok" && carouselItems.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-7">
      {/* ── Header ── */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
            공고 탐색
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            외교부 공공데이터 기반 국제기구 공고
          </p>
        </div>
      </div>

      {/* ── 섹션 A: 맞춤 공고 캐러셀 ── */}
      {showCarousel && (
        <div className="border-border bg-card mb-8 overflow-hidden rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="text-point-hover flex items-center gap-1.5 text-sm font-bold">
                <Sparkles className="size-4" /> 나의 맞춤 공고
              </h2>
              {summaryText && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {summaryText}
                </p>
              )}
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-label="이전"
                onClick={() => scrollCarousel("prev")}
                className="border-border hover:border-point flex size-8 items-center justify-center rounded-lg border transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="다음"
                onClick={() => scrollCarousel("next")}
                className="border-border hover:border-point flex size-8 items-center justify-center rounded-lg border transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <div
            ref={carouselRef}
            onClickCapture={suppressClickAfterDrag}
            onPointerCancel={endCarouselDrag}
            onPointerDown={startCarouselDrag}
            onPointerLeave={endCarouselDrag}
            onPointerMove={moveCarouselDrag}
            onPointerUp={endCarouselDrag}
            className={cn(
              "flex touch-pan-x [scroll-snap-type:x_mandatory] [scroll-padding-left:1.5rem] [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth px-6 pb-5 select-none [&::-webkit-scrollbar]:hidden",
              isCarouselDragging ? "cursor-grabbing" : "cursor-grab",
            )}
          >
            {carouselItems.map((o) => (
              <div
                key={o.id}
                className="h-[286px] w-[min(300px,calc(100vw-4.5rem))] shrink-0 [scroll-snap-align:start]"
              >
                <JobCard job={o} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 섹션 B: 전체 공고 그리드 ── */}
      {state === "ok" && (
        <div className="mb-1">
          <h2 className="text-foreground text-lg font-extrabold tracking-tight">
            전체 공고
          </h2>
        </div>
      )}

      {/* 탭 + 정렬 */}
      {state === "ok" && allItems.length > 0 && (
        <div className="my-4 flex flex-wrap items-center gap-2.5">
          {TABS.map((t) => (
            <FilterChip
              key={t.key}
              label={t.label}
              active={activeTab === t.key}
              onClick={() => selectTab(t.key)}
            />
          ))}

          <div className="border-border bg-card ml-auto flex gap-1.5 rounded-[9px] border p-[3px]">
            <SortButton
              label="최신순"
              active={sort === "latest"}
              onClick={() => selectSort("latest")}
            />
            <SortButton
              label="마감순"
              active={sort === "deadline"}
              onClick={() => selectSort("deadline")}
            />
          </div>
        </div>
      )}

      {/* ── States ── */}
      {state === "loading" && <JobCardSkeletonGrid />}
      {state === "ok" && allItems.length === 0 && (
        <div className="text-muted-foreground py-[70px] text-center">
          <p className="text-foreground text-[15px] font-bold">
            표시할 공고가 없어요
          </p>
          <p className="mt-1.5 text-sm">
            연결은 됐지만 공고 데이터가 비어 있습니다 (DB 시드 필요).
          </p>
        </div>
      )}
      {state === "ok" && allItems.length > 0 && visible.length === 0 && (
        <div className="text-muted-foreground py-[70px] text-center">
          <p className="text-foreground text-[15px] font-bold">
            해당 유형의 공고가 없어요
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
          백엔드를 <code>localhost:8000</code>에서 실행했는지,{" "}
          <code>ALLOWED_ORIGINS</code>에 이 앱 주소가 포함됐는지 확인하세요.
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
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
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
