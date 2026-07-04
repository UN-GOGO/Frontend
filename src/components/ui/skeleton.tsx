import { cn } from "@/lib/utils";

/** 로딩 중 콘텐츠 자리를 잡아주는 스켈레톤 블록.
 *  bg-muted + animate-pulse 로 은은한 점멸 효과를 준다. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
