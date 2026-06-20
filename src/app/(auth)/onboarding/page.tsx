"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Step = {
  title: string;
  desc: string;
  preview: React.ReactNode;
};

const STEPS: Step[] = [
  {
    title: "전 세계 공고, AI가 골라줘요",
    desc: '"환경 관련 UN 인턴십" 한 문장이면 적합도가 붙은 공고를 정리해 드립니다.',
    preview: (
      <div className="flex w-full animate-[pol-up_0.35s_ease] flex-col gap-2.25">
        <div className="bg-point self-end rounded-[12px_12px_3px_12px] px-3 py-2 text-xs font-semibold text-white">
          환경 관련 UN 인턴십 알려줘
        </div>
        <div className="bg-card flex w-[84%] flex-col gap-1.75 self-start rounded-[3px_12px_12px_12px] px-3.25 py-2.75">
          <div className="flex items-center justify-between">
            <span className="text-primary text-[11px] font-extrabold">
              UNEP · 환경정책 인턴
            </span>
            <span className="bg-point rounded-md px-1.75 py-0.75 text-[10px] font-extrabold text-white">
              92%
            </span>
          </div>
          <div>
            <span className="text-destructive rounded-[5px] bg-[#FEF2F2] px-1.75 py-0.5 text-[10px] font-bold">
              D-5
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "외교부 공공데이터로 매일 갱신",
    desc: "신뢰할 수 있는 공공데이터에서 마감·요건을 실시간으로 가져옵니다.",
    preview: (
      <div className="bg-card flex w-full animate-[pol-up_0.35s_ease] flex-col gap-2.75 rounded-[14px] p-4">
        <div className="flex items-center gap-1.75">
          <span className="bg-point size-2 animate-[pol-blink_1.6s_infinite] rounded-full" />
          <span className="text-muted-foreground font-mono text-[10px] tracking-[0.5px]">
            LIVE DATA · 외교부 공공데이터
          </span>
        </div>
        <div className="flex flex-col gap-1.75">
          <div className="bg-accent h-2.25 w-[90%] rounded-[5px]" />
          <div className="h-2.25 w-[70%] rounded-[5px] bg-[#F1F5F9]" />
          <div className="h-2.25 w-[80%] rounded-[5px] bg-[#F1F5F9]" />
        </div>
        <div className="text-muted-foreground/80 font-mono text-[10px]">
          2026.06.13 09:00 KST
        </div>
      </div>
    ),
  },
  {
    title: "프로필을 채우면 적합도가 켜져요",
    desc: "전공·언어·스킬만 입력하면 매칭과 갭 분석이 자동으로 작동합니다.",
    preview: (
      <div className="bg-card flex w-full animate-[pol-up_0.35s_ease] flex-col gap-2.5 rounded-[14px] p-4">
        <div className="flex gap-2.5">
          <div className="bg-background flex-1 rounded-[10px] px-1.5 py-3 text-center">
            <div className="text-primary text-[22px] leading-none font-extrabold">
              6
            </div>
            <div className="text-muted-foreground mt-1 text-[10px]">
              지원 가능
            </div>
          </div>
          <div className="bg-accent flex-1 rounded-[10px] px-1.5 py-3 text-center">
            <div className="text-point text-[22px] leading-none font-extrabold">
              92%
            </div>
            <div className="text-point-hover mt-1 text-[10px]">최고 적합도</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="bg-primary rounded-md px-2.25 py-1 text-[10px] font-bold text-white">
            데이터 분석
          </span>
          <span className="bg-primary rounded-md px-2.25 py-1 text-[10px] font-bold text-white">
            영어 보고서
          </span>
          <span className="bg-accent text-point-hover rounded-md px-2.25 py-1 text-[10px] font-bold">
            + 스킬 추가
          </span>
        </div>
      </div>
    ),
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  // 스킵 또는 완료 → 프로필 입력 화면으로 (현재는 홈으로)
  const finish = () => router.push("/");

  const next = () => (isLast ? finish() : setStep((s) => s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const current = STEPS[step];

  return (
    <div className="bg-background flex flex-1 flex-col overflow-y-auto">
      {/* 상단: 스텝 인디케이터 + 스킵 */}
      <div className="flex items-center justify-between px-5.5 py-5">
        <div className="flex items-center gap-1.75">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={
                i === step
                  ? "bg-point h-2 w-5.5 rounded-[5px] transition-all"
                  : "h-2 w-2 rounded-full bg-[#D6DEEA] transition-all"
              }
            />
          ))}
        </div>
        <button
          type="button"
          onClick={finish}
          className="text-muted-foreground text-[13px] font-bold whitespace-nowrap"
        >
          나중에 하기
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pt-1.5 pb-7.5">
        <div className="w-full max-w-110">
          {/* 미리보기 박스 */}
          <div className="bg-primary mb-6.5 flex h-49 items-center justify-center overflow-hidden rounded-[20px] p-5.5">
            {current.preview}
          </div>

          {/* 타이틀 + 설명 */}
          <div className="px-1.5 text-center">
            <h2 className="text-foreground mb-2 text-[22px] font-extrabold tracking-[-0.4px]">
              {current.title}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {current.desc}
            </p>
          </div>

          {/* 이전 / 다음 */}
          <div className="mt-7.5 flex gap-2.5">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="border-border shrink-0 rounded-xl border bg-white px-5 py-3.25 text-sm font-bold text-[#475569] transition-colors hover:border-[#C9D3E0]"
              >
                이전
              </button>
            )}
            <Button
              onClick={next}
              className="h-auto flex-1 rounded-xl py-3.25 font-extrabold hover:bg-[#243152]"
            >
              {isLast ? "시작하기" : "다음"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
