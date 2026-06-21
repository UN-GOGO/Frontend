"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ProfileSummary } from "@/lib/navigator/types";

const selectClass =
  "border-border text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex-1 rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-3";
const inputClass =
  "border-border text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex-1 rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-3";

const SECOND_LANGS = [
  "없음",
  "프랑스어",
  "스페인어",
  "러시아어",
  "중국어",
  "아랍어",
  "기타",
];

export function ProfileIntro({
  onStart,
}: {
  onStart: (summary: ProfileSummary) => void;
}) {
  const [nick, setNick] = useState("");
  const [major, setMajor] = useState("");
  const [degree, setDegree] = useState("");
  const [exp, setExp] = useState("");
  const [english, setEnglish] = useState("");
  const [secondRaw, setSecondRaw] = useState("");
  const [etc, setEtc] = useState("");

  const start = () => {
    let second = secondRaw;
    if (secondRaw === "기타")
      second = etc.trim() ? `기타(${etc.trim()})` : "기타";
    onStart({ nick, major, degree, exp, english, second });
  };

  return (
    <div className="bg-primary animate-[pol-up_0.35s_ease] rounded-[20px] p-6 text-center text-white">
      <div className="mb-3 text-4xl">🧭</div>
      <h1 className="mb-2 text-[22px] font-extrabold tracking-[-0.4px]">
        나에게 맞는 국제기구 찾기
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-white/70">
        국제기구가 너무 많아 막막한가요?
        <br />
        9개 질문이면 당신에게 맞는 기구를 나침반이 가리켜드려요.
      </p>

      <div className="mb-6 space-y-2.5 rounded-[16px] bg-white/10 p-4 text-left">
        <p className="text-xs text-white/70">
          먼저, 기본 정보를 알려주세요{" "}
          <span className="text-white/50">
            (선택 — 입력할수록 추천이 정확해져요)
          </span>
        </p>
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="닉네임 (예: 유엔고고)"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="전공/관심 학문 (예: 환경학)"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className={selectClass}
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          >
            <option value="">학력</option>
            <option>고등학교 재학</option>
            <option>학부 재학</option>
            <option>학사 졸업</option>
            <option>석사 이상</option>
          </select>
          <select
            className={selectClass}
            value={exp}
            onChange={(e) => setExp(e.target.value)}
          >
            <option value="">국제기구·관련 경험</option>
            <option>없음</option>
            <option>동아리·공모전</option>
            <option>인턴십</option>
            <option>실무 경력</option>
          </select>
        </div>
        <select
          className={selectClass + " w-full"}
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
        >
          <option value="">영어 수준 (기능 기준)</option>
          <option>일상 회화 가능</option>
          <option>업무 이메일·문서 작성 가능</option>
          <option>회의·발표·협상 등 자유로운 업무 수행</option>
        </select>
        <div className="flex gap-2">
          <select
            className={selectClass}
            value={secondRaw}
            onChange={(e) => setSecondRaw(e.target.value)}
          >
            <option value="">제2외국어</option>
            {SECOND_LANGS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {secondRaw === "기타" && (
            <input
              className={inputClass}
              placeholder="어떤 언어인가요?"
              value={etc}
              onChange={(e) => setEtc(e.target.value)}
            />
          )}
        </div>
      </div>

      <Button
        onClick={start}
        className="bg-point h-auto w-full rounded-xl py-3.25 font-extrabold hover:bg-[var(--point-hover)]"
      >
        시작하기 →
      </Button>
    </div>
  );
}
