import { Skeleton } from "@/components/ui/skeleton";

/** JobDetailClient 레이아웃에 맞춘 로딩 스켈레톤. */
export function JobDetailSkeleton() {
  return (
    <article className="bg-card border-border rounded-2xl border p-6">
      {/* org + bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="size-6 rounded-md" />
      </div>

      {/* title */}
      <div className="mt-4 flex flex-col gap-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>

      {/* tags */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-6 w-14 rounded-lg" />
      </div>

      {/* deadline line */}
      <Skeleton className="mt-4 h-3 w-32" />

      {/* description */}
      <div className="border-border mt-5 flex flex-col gap-2 border-t pt-5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>

      {/* apply */}
      <Skeleton className="mt-6 h-[46px] w-full rounded-xl" />
    </article>
  );
}
