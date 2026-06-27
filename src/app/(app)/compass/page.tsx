import { CompassFlow } from "@/components/navigator/compass-flow";

export const metadata = {
  title: "나침반 · 나에게 맞는 국제기구 — I-OGO",
};

export default function CompassPage() {
  return (
    <div className="bg-background flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-8">
        <header className="mb-6 flex items-center gap-3">
          <span className="bg-point-soft flex size-11 shrink-0 items-center justify-center rounded-2xl text-2xl">
            🧭
          </span>
          <div>
            <h1 className="text-primary text-2xl font-extrabold tracking-tight">
              나침반
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              9개 질문으로 나에게 맞는 국제기구를 찾아드려요.
            </p>
          </div>
        </header>
        <CompassFlow />
      </div>
    </div>
  );
}
