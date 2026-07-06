import { Skeleton } from "@/components/ui/skeleton";

/** InsightCard 레이아웃에 맞춘 로딩 스켈레톤. */
export function InsightCardSkeleton() {
  return (
    <div className="border-border bg-card flex h-full flex-col overflow-hidden rounded-[14px] border">
      <Skeleton className="aspect-[16/9] w-full shrink-0 rounded-none" />
      <div className="flex flex-1 flex-col p-[18px]">
        {/* Top: Title + Bookmark */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="size-[18px] shrink-0 rounded-md" />
        </div>

        {/* Middle: Summary */}
        <div className="mb-auto flex flex-col gap-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>

        {/* Bottom: Tags */}
        <div className="border-border/50 mt-4 flex items-center gap-2 border-t pt-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** 맞춤 인사이트 + 관심사 통계 영역 전체 스켈레톤. */
export function InsightSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      <section className="mb-8">
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <InsightCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </>
  );
}
