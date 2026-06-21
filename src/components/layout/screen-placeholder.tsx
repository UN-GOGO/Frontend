import { PolarisMark } from "@/components/layout/polaris-mark";

type Copy = { title: string; subtitle: string };

/**
 * Stub body for a screen — the app shell is in place, the screen content is
 * wired in later. Keeps every route navigable and on-brand.
 */
export function ScreenPlaceholder({ copy }: { copy: Copy }) {
  const { title, subtitle } = copy;

  return (
    <div className="mx-auto flex min-h-full max-w-[760px] flex-col items-center justify-center px-6 py-16 text-center">
      <PolarisMark className="mb-6 size-16 rounded-2xl text-[34px]" />
      <h1 className="text-primary mb-1.5 text-2xl font-extrabold tracking-tight">
        {title}
      </h1>
      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
        {subtitle}
      </p>
      <span className="bg-point-soft text-point-hover mt-5 rounded-full px-3 py-1 font-mono text-[11px] font-bold">
        화면 준비 중
      </span>
    </div>
  );
}
