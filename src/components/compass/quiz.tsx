"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { flowFor, type ChipOption, type QuizStep } from "@/lib/compass/flows";
import type { Answer, CompassTrack } from "@/lib/compass/types";
import { cn } from "@/lib/utils";

// 나침반 진단 퀴즈 — "기존형식"(스텝 카드형).
// 정보입력(대화형)이 끝난 뒤, 트랙별 문항 은행(flows.ts)을 한 문항씩 카드로 보여준다.
// - single : 보기 선택 즉시 다음 문항으로 자동 진행
// - multi  : 최대 max개까지 토글, "다음" 버튼으로 진행
// - text   : 자유서술, "결과 보기" 버튼으로 마무리(선택 항목은 건너뛰기 가능)
export function Quiz({
  track,
  onFinish,
  onExit,
}: {
  track: CompassTrack;
  onFinish: (answers: Answer[]) => void;
  onExit: () => void;
}) {
  const quiz = flowFor(track).quiz;
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() =>
    Array(quiz.length).fill(null),
  );

  const Q = quiz[cur];
  const isLast = cur === quiz.length - 1;

  const setAnswer = (i: number, v: Answer) =>
    setAnswers((prev) => {
      const next = prev.slice();
      next[i] = v;
      return next;
    });

  const goNext = () => (isLast ? onFinish(answers) : setCur((c) => c + 1));
  // 첫 문항에서 뒤로 = 정보입력(대화)으로 되돌아감
  const back = () => (cur === 0 ? onExit() : setCur((c) => c - 1));

  // 답을 즉시 반영한 배열로 마무리(setState 비동기 반영 지연 회피)
  const finishWith = (v: Answer) =>
    onFinish(answers.map((a, k) => (k === cur ? v : a)));

  return (
    <div className="mx-auto max-w-[680px] animate-[pol-up_0.35s_ease]">
      {/* 진행 표시 */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-point-hover tabular-nums">
            {cur + 1}
            <span className="text-muted-foreground"> / {quiz.length}</span>
          </span>
          <span className="text-muted-foreground">
            {track === "interest" ? "흥미·입문 진단" : "고급·정보취득 진단"}
          </span>
        </div>
        <div className="bg-secondary h-2 overflow-hidden rounded-full">
          <div
            className="bg-point h-full rounded-full transition-all duration-300"
            style={{ width: `${((cur + 1) / quiz.length) * 100}%` }}
          />
        </div>
      </div>

      <div
        key={cur}
        className="bg-card border-border animate-[pol-up_0.3s_ease] rounded-[18px] border p-6 sm:p-7"
      >
        <h2 className="text-foreground mb-5 text-lg leading-snug font-extrabold tracking-tight text-balance">
          {Q.ask}
        </h2>

        {Q.kind === "text" ? (
          <TextStep
            step={Q}
            value={
              typeof answers[cur] === "string" ? (answers[cur] as string) : ""
            }
            onChange={(v) => setAnswer(cur, v)}
            onSubmit={(v) => finishWith(v)}
          />
        ) : Q.kind === "multi" ? (
          <MultiStep
            opts={Q.opts}
            max={Q.max}
            value={
              Array.isArray(answers[cur]) ? (answers[cur] as number[]) : []
            }
            onChange={(v) => setAnswer(cur, v)}
            onNext={goNext}
            isLast={isLast}
          />
        ) : (
          <SingleStep
            opts={Q.opts}
            value={
              typeof answers[cur] === "number" ? (answers[cur] as number) : null
            }
            onPick={(i) => {
              setAnswer(cur, i);
              if (isLast) finishWith(i);
              else setCur((c) => c + 1);
            }}
          />
        )}
      </div>

      <button
        type="button"
        onClick={back}
        className="text-muted-foreground hover:text-foreground mt-3 text-xs font-semibold"
      >
        ← {cur === 0 ? "정보 입력으로" : "이전"}
      </button>
    </div>
  );
}

const optBase =
  "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition";
const optOn = "border-point bg-point-soft text-foreground";
const optOff = "border-border hover:border-point-border text-foreground";

function Indicator({ on, square }: { on: boolean; square?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center border transition",
        square ? "rounded-md" : "rounded-full",
        on ? "border-point bg-point text-white" : "border-border bg-white",
      )}
    >
      {on && <Check className="size-3.5" strokeWidth={3} />}
    </span>
  );
}

function SingleStep({
  opts,
  value,
  onPick,
}: {
  opts: ChipOption[];
  value: number | null;
  onPick: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {opts.map((o, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          className={cn(optBase, value === i ? optOn : optOff)}
        >
          <Indicator on={value === i} />
          {o.t}
        </button>
      ))}
    </div>
  );
}

function MultiStep({
  opts,
  max,
  value,
  onChange,
  onNext,
  isLast,
}: {
  opts: ChipOption[];
  max: number;
  value: number[];
  onChange: (v: number[]) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const toggle = (i: number) => {
    let arr = value.slice();
    if (arr.includes(i)) arr = arr.filter((x) => x !== i);
    else {
      if (arr.length >= max) arr.shift();
      arr.push(i);
    }
    onChange(arr);
  };
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground -mt-2 text-xs">최대 {max}개 선택</p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {opts.map((o, i) => {
          const on = value.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={cn(optBase, on ? optOn : optOff)}
            >
              <Indicator on={on} square />
              {o.t}
            </button>
          );
        })}
      </div>
      <Button
        onClick={onNext}
        disabled={value.length === 0}
        className="bg-point hover:bg-point-hover h-auto w-full rounded-xl py-3 font-semibold"
      >
        {isLast ? "결과 보기" : "다음"}
        <span className="ml-1.5 tabular-nums opacity-80">
          {value.length}/{max}
        </span>{" "}
        →
      </Button>
    </div>
  );
}

function TextStep({
  step,
  value,
  onChange,
  onSubmit,
}: {
  step: Extract<QuizStep, { kind: "text" }>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <textarea
        rows={3}
        className="border-border text-foreground placeholder:text-muted-foreground focus-visible:border-point focus-visible:ring-point/30 w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus-visible:ring-3"
        placeholder={step.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <Button
          onClick={() => onSubmit(value.trim())}
          className="bg-point hover:bg-point-hover h-auto flex-1 rounded-xl py-3 font-semibold"
        >
          결과 보기 →
        </Button>
        {step.optional && (
          <button
            type="button"
            onClick={() => onSubmit("")}
            className="text-muted-foreground hover:text-foreground text-xs font-semibold"
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
