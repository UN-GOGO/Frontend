import { CompassFlow } from "@/components/navigator/compass-flow";

export const metadata = {
  title: "나침반 · 나에게 맞는 국제기구 — Polaris",
};

export default function CompassPage() {
  return (
    <div className="bg-background flex flex-1 flex-col overflow-y-auto">
      <header className="flex items-center gap-2 px-5.5 py-5">
        <span className="text-xl">🧭</span>
        <span className="text-foreground font-bold">
          나침반 · 나에게 맞는 국제기구
        </span>
      </header>
      <div className="flex flex-1 justify-center px-5 pt-1.5 pb-8">
        <CompassFlow />
      </div>
    </div>
  );
}
