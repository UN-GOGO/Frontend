import { cn } from "@/lib/utils";

/**
 * Polaris mark (v1 / slate) — a violet rounded square with a four-point
 * star (✦). Sized via `className` (defaults to 30px, matching the header
 * logo in the design comp).
 */
export function PolarisMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-point text-point-foreground flex size-[30px] shrink-0 items-center justify-center rounded-[9px] text-[17px] leading-none",
        className,
      )}
    >
      ✦
    </span>
  );
}
