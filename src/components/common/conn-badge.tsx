import { cn } from "@/lib/utils";

export type ConnState = "loading" | "ok" | "error";

/** 백엔드 연결 상태를 한눈에 보여주는 배지 (연결 테스트용) */
export function ConnBadge({
  state,
  error,
}: {
  state: ConnState;
  error?: string | null;
}) {
  const label =
    state === "loading"
      ? "백엔드 연결 중…"
      : state === "ok"
        ? "백엔드 연결됨 ✅"
        : `백엔드 연결 실패 ❌ ${error ?? ""}`;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] font-bold",
        state === "loading" && "bg-muted text-muted-foreground",
        state === "ok" && "bg-point-soft text-point-hover",
        state === "error" && "bg-destructive/10 text-destructive",
      )}
    >
      {label}
    </span>
  );
}
