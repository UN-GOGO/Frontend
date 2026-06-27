"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { QUESTIONS } from "@/lib/compass/questions";
import type { Answer } from "@/lib/compass/types";
import { cn } from "@/lib/utils";

export function Quiz({
  onFinish,
  onExit,
}: {
  onFinish: (answers: Answer[]) => void;
  onExit: () => void;
}) {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() =>
    Array(QUESTIONS.length).fill(null),
  );

  const Q = QUESTIONS[cur];
  const isLast = cur === QUESTIONS.length - 1;
  const setAnswer = (i: number, v: Answer) =>
    setAnswers((prev) => {
      const next = prev.slice();
      next[i] = v;
      return next;
    });

  const goNext = () => (isLast ? onFinish(answers) : setCur((c) => c + 1));
  const back = () => (cur === 0 ? onExit() : setCur((c) => c - 1));

  return (
    <div className="mx-auto max-w-[680px] animate-[pol-up_0.35s_ease]">
      {/* 진행 표시 */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-point-hover tabular-nums">
            {cur + 1}
            <span className="text-muted-foreground"> / {QUESTIONS.length}</span>
          </span>
          <span className="text-muted-foreground">나침반 진단</span>
        </div>
        <div className="bg-secondary h-2 overflow-hidden rounded-full">
          <div
            className="bg-point h-full rounded-full transition-all duration-300"
            style={{ width: `${((cur + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <div
        key={cur}
        className="bg-card border-border animate-[pol-up_0.3s_ease] rounded-[18px] border p-6 sm:p-7"
      >
        <h2 className="text-foreground mb-5 text-lg leading-snug font-extrabold tracking-tight text-balance">
          {Q.q}
        </h2>

        {Q.type === "text" ? (
          <TextStep
            placeholder={Q.placeholder}
            value={
              typeof answers[cur] === "string" ? (answers[cur] as string) : ""
            }
            onChange={(v) => setAnswer(cur, v)}
            onSubmit={(v) => {
              setAnswer(cur, v);
              onFinish(answers.map((a, i) => (i === cur ? v : a)));
            }}
          />
        ) : Q.type === "multi" ? (
          <MultiStep
            opts={Q.opts}
            max={Q.max}
            value={
              Array.isArray(answers[cur]) ? (answers[cur] as number[]) : []
            }
            onChange={(v) => setAnswer(cur, v)}
            onNext={goNext}
          />
        ) : (
          <SingleStep
            opts={Q.opts}
            value={
              typeof answers[cur] === "number" ? (answers[cur] as number) : null
            }
            onPick={(i) => {
              setAnswer(cur, i);
              if (isLast) {
                onFinish(answers.map((a, k) => (k === cur ? i : a)));
              } else {
                setCur((c) => c + 1);
              }
            }}
          />
        )}
      </div>

      <button
        type="button"
        onClick={back}
        className="text-muted-foreground hover:text-foreground mt-3 text-xs font-semibold"
      >
        ← {cur === 0 ? "기본 정보로" : "이전"}
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
  opts: { t: string }[];
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
}: {
  opts: { t: string }[];
  max: number;
  value: number[];
  onChange: (v: number[]) => void;
  onNext: () => void;
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
        다음
        <span className="ml-1.5 tabular-nums opacity-80">
          {value.length}/{max}
        </span>{" "}
        →
      </Button>
    </div>
  );
}

function TextStep({
  placeholder,
  value,
  onChange,
  onSubmit,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <textarea
        rows={3}
        className="border-border text-foreground placeholder:text-muted-foreground focus-visible:border-point focus-visible:ring-point/30 w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus-visible:ring-3"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        onClick={() => onSubmit(value.trim())}
        className="bg-point hover:bg-point-hover h-auto w-full rounded-xl py-3 font-semibold"
      >
        결과 보기 →
      </Button>
    </div>
  );
}
