import { Skeleton } from "@/components/ui/skeleton";

/** InsightCard 레이아웃에 맞춘 로딩 스켈레톤. */
export function InsightCardSkeleton() {
  return (
    <div className="border-border bg-card rounded-[14px] border p-[18px]">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="ml-auto size-[18px] rounded-md" />
      </div>
      <div className="mb-[7px] flex flex-col gap-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

/** 맞춤 인사이트 + 관심사 통계 영역 전체 스켈레톤. */
export function InsightSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      <section className="mb-8">
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <InsightCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
