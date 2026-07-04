import { Skeleton } from "@/components/ui/skeleton";

/** JobCard 레이아웃에 맞춘 로딩 스켈레톤. */
export function JobCardSkeleton() {
  return (
    <div className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-[18px]">
      {/* org + bookmark */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <Skeleton className="size-[38px] shrink-0 rounded-[10px]" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <Skeleton className="size-5 rounded-md" />
      </div>

      {/* title + type tag */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-1 h-5 w-16 rounded-md" />
      </div>

      {/* description */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      {/* footer */}
      <div className="border-secondary mt-auto flex items-center justify-between gap-2.5 border-t pt-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-14 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/** 그리드에 채워 넣을 스켈레톤 카드 묶음. */
export function JobCardSkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(312px,1fr))] gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}
