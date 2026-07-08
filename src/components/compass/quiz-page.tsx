"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { flowFor, type ChipOption, type QuizStep } from "@/lib/compass/flows";
import type { Answer, CompassTrack } from "@/lib/compass/types";
import { cn } from "@/lib/utils";

export function QuizPage({
  track,
  onFinish,
  onExit,
}: {
  track: CompassTrack;
  onFinish: (answers: Answer[]) => void;
  onExit: () => void;
}) {
  const flow = flowFor(track);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    Array(flow.quiz.length).fill(null),
  );

  const step = flow.quiz[idx];
  const progress = flow.quiz.length ? ((idx + 1) / flow.quiz.length) * 100 : 0;

  const answer = (value: Answer) => {
    const next = answers.slice();
    next[idx] = value;
    setAnswers(next);

    if (idx >= flow.quiz.length - 1) {
      onFinish(next);
      return;
    }
    setIdx((cur) => cur + 1);
  };

  const goBack = () => {
    if (idx === 0) {
      onExit();
      return;
    }
    setIdx((cur) => cur - 1);
  };

  return (
    <div className="mx-auto flex min-h-[68vh] w-full max-w-[920px] flex-col justify-center px-1 py-4">
      <div className="mb-8">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-point-hover">나침반 퀴즈</span>
          <span className="text-muted-foreground tabular-nums">
            {idx + 1} / {flow.quiz.length}
          </span>
        </div>
        <div className="bg-secondary h-2 overflow-hidden rounded-full">
          <div
            className="bg-point h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <section className="mx-auto w-full max-w-[760px]">
        <p className="text-point-hover mb-3 text-sm font-semibold">
          {track === "interest" ? "흥미 탐색" : "상세 진단"}
        </p>
        <h1 className="text-foreground text-2xl leading-tight font-bold sm:text-3xl">
          {step.ask}
        </h1>
        {step.hint && (
          <p className="text-muted-foreground mt-3 text-sm">{step.hint}</p>
        )}

        <div className="mt-8">
          <QuizStepInput
            key={idx}
            step={step}
            initial={answers[idx]}
            isLast={idx === flow.quiz.length - 1}
            onAnswer={answer}
          />
        </div>

        <button
          type="button"
          onClick={goBack}
          className="text-muted-foreground hover:text-foreground mt-6 text-xs font-semibold"
        >
          ← 이전
        </button>
      </section>
    </div>
  );
}

function QuizStepInput({
  step,
  initial,
  isLast,
  onAnswer,
}: {
  step: QuizStep;
  initial: Answer;
  isLast: boolean;
  onAnswer: (value: Answer) => void;
}) {
  const [multi, setMulti] = useState<number[]>(
    Array.isArray(initial) ? initial : [],
  );
  const [text, setText] = useState(typeof initial === "string" ? initial : "");

  const buttonLabel = isLast ? "결과 보기" : "다음";

  if (step.kind === "single") {
    const cur = typeof initial === "number" ? initial : null;
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {step.opts.map((o, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAnswer(i)}
            className={cn(optBase, cur === i ? optOn : optOff)}
          >
            <Indicator on={cur === i} />
            {o.t}
          </button>
        ))}
      </div>
    );
  }

  if (step.kind === "multi") {
    return (
      <MultiQuizInput
        step={step}
        multi={multi}
        setMulti={setMulti}
        buttonLabel={buttonLabel}
        onAnswer={onAnswer}
      />
    );
  }

  const submit = () => {
    const value = text.trim();
    if (!value && !step.optional) return;
    onAnswer(value);
  };

  return (
    <div className="space-y-3">
      <textarea
        rows={5}
        className="border-border text-foreground placeholder:text-muted-foreground focus-visible:border-point focus-visible:ring-point/30 w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus-visible:ring-3"
        placeholder={step.placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={submit}
          disabled={!text.trim() && !step.optional}
          className="bg-point hover:bg-point-hover h-auto flex-1 rounded-xl py-3 font-semibold"
        >
          {buttonLabel} →
        </Button>
        {step.optional && (
          <button
            type="button"
            onClick={() => onAnswer("")}
            className="text-muted-foreground hover:text-foreground px-3 text-xs font-semibold"
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}

function MultiQuizInput({
  step,
  multi,
  setMulti,
  buttonLabel,
  onAnswer,
}: {
  step: Extract<QuizStep, { kind: "multi" }>;
  multi: number[];
  setMulti: (value: number[]) => void;
  buttonLabel: string;
  onAnswer: (value: Answer) => void;
}) {
  const opts = step.opts as ChipOption[];
  const selectedText = useMemo(
    () => multi.map((i) => opts[i]?.t).filter(Boolean),
    [multi, opts],
  );

  const toggle = (i: number) => {
    let next = multi.slice();
    if (next.includes(i)) next = next.filter((x) => x !== i);
    else {
      if (next.length >= step.max) return;
      next.push(i);
    }
    setMulti(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        최대 {step.max}개까지 선택할 수 있어요
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {opts.map((o, i) => {
          const on = multi.includes(i);
          const disabled = !on && multi.length >= step.max;
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={disabled}
              className={cn(
                optBase,
                on ? optOn : optOff,
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <Indicator on={on} square />
              {o.t}
            </button>
          );
        })}
      </div>
      <Button
        onClick={() => onAnswer(multi)}
        disabled={selectedText.length === 0}
        className="bg-point hover:bg-point-hover h-auto w-full rounded-xl py-3 font-semibold"
      >
        {buttonLabel}
        <span className="ml-1.5 tabular-nums opacity-80">
          {selectedText.length}/{step.max}
        </span>
        →
      </Button>
    </div>
  );
}

const optBase =
  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition";
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
