import Link from "next/link";

export function CompassBanner() {
  return (
    <Link
      href="/compass"
      className="border-point-border bg-point-soft mb-6 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition-colors hover:opacity-90"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🧭</span>
        <div>
          <div className="text-point-hover text-sm font-extrabold">
            나침반으로 내 커리어 방향을 진단해보세요
          </div>
          <div className="text-muted-foreground mt-0.5 text-xs">
            맞춤 공고·인사이트를 상위에 보여드려요
          </div>
        </div>
      </div>
      <span className="text-point-hover shrink-0 text-sm font-bold whitespace-nowrap">
        시작하기 →
      </span>
    </Link>
  );
}
