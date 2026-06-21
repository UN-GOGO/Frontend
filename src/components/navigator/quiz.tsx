"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { QUESTIONS } from "@/lib/navigator/questions";
import type { Answer } from "@/lib/navigator/types";

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
    <div className="animate-[pol-up_0.35s_ease]">
      {/* 진행 표시 */}
      <div className="mb-4">
        <div className="text-muted-foreground mb-1 flex justify-between text-xs">
          <span>
            {cur + 1} / {QUESTIONS.length}
          </span>
          <span>나침반 진단</span>
        </div>
        <div className="bg-secondary h-1.5 rounded-full">
          <div
            className="bg-point h-1.5 rounded-full transition-all"
            style={{ width: `${((cur + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <div
        key={cur}
        className="bg-card border-border animate-[pol-up_0.3s_ease] rounded-[18px] border p-6"
      >
        <h2 className="text-foreground mb-5 text-lg font-bold">{Q.q}</h2>

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
        className="text-muted-foreground hover:text-foreground mt-3 text-xs"
      >
        ← {cur === 0 ? "기본 정보로" : "이전"}
      </button>
    </div>
  );
}

const optBase =
  "w-full rounded-xl border px-4 py-3 text-left text-sm transition";
const optOn = "border-point bg-point-soft text-foreground";
const optOff = "border-border hover:border-point-border";

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
    <div className="space-y-2">
      {opts.map((o, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          className={`${optBase} ${value === i ? optOn : optOff}`}
        >
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
    <div className="space-y-2">
      {opts.map((o, i) => {
        const on = value.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`${optBase} ${on ? optOn : optOff}`}
          >
            <span className="mr-2">{on ? "☑" : "☐"}</span>
            {o.t}
          </button>
        );
      })}
      <div className="pt-2">
        <Button
          onClick={onNext}
          disabled={value.length === 0}
          className="bg-point h-auto w-full rounded-xl py-3 font-semibold hover:bg-[var(--point-hover)]"
        >
          다음 →
        </Button>
      </div>
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
        className="border-border text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-xl border px-4 py-3 text-sm outline-none focus-visible:ring-3"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        onClick={() => onSubmit(value.trim())}
        className="bg-point h-auto w-full rounded-xl py-3 font-semibold hover:bg-[var(--point-hover)]"
      >
        결과 보기 →
      </Button>
    </div>
  );
}
