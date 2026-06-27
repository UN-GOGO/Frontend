"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getProfile, updateProfile, type ProfileUpdate } from "@/lib/api/iogo";
import { getUserId } from "@/lib/api/user";
import type { ProfileSummary } from "@/lib/compass/types";

const controlClass =
  "border-border text-foreground placeholder:text-muted-foreground focus-visible:border-point focus-visible:ring-point/30 w-full rounded-[10px] border bg-white px-3 py-2.5 text-sm outline-none transition focus-visible:ring-3";

const SECOND_LANGS = [
  "없음",
  "프랑스어",
  "스페인어",
  "러시아어",
  "중국어",
  "아랍어",
  "기타",
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}

export function ProfileIntro({
  onStart,
}: {
  onStart: (summary: ProfileSummary) => void;
}) {
  const [major, setMajor] = useState("");
  const [degree, setDegree] = useState("");
  const [exp, setExp] = useState("");
  const [english, setEnglish] = useState("");
  const [secondRaw, setSecondRaw] = useState("");
  const [etc, setEtc] = useState("");

  // 마이페이지 → 나침반: 저장된 프로필에서 겹치는 필드(전공·학력)만 미리 채운다.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await getUserId();
        const p = await getProfile(id);
        if (cancelled) return;
        if (p.major) setMajor(p.major);
        if (p.education) setDegree(p.education); // 학력 옵션이 양쪽 동일
      } catch {
        // 프로필 없음(404)·비로그인 → 무시
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const start = () => {
    let second = secondRaw;
    if (secondRaw === "기타")
      second = etc.trim() ? `기타(${etc.trim()})` : "기타";

    // 나침반 → 마이페이지: 겹치는 필드(전공·학력)만 프로필에 저장(best-effort).
    // 빈 값은 보내지 않아 기존 프로필을 덮어쓰지 않는다.
    void (async () => {
      try {
        const patch: ProfileUpdate = {};
        if (major.trim()) patch.major = major.trim();
        if (degree) patch.education = degree;
        if (Object.keys(patch).length === 0) return;
        const id = await getUserId();
        await updateProfile(id, patch);
      } catch {
        // 저장 실패는 무시 — 진단 흐름은 막지 않는다
      }
    })();

    onStart({ nick: "", major, degree, exp, english, second });
  };

  return (
    <div className="animate-[pol-up_0.35s_ease] space-y-4">
      {/* Hero */}
      <div className="bg-primary relative overflow-hidden rounded-[20px] px-7 py-8 text-center text-white">
        <span
          className="pointer-events-none absolute -top-10 -right-8 size-40 rounded-full blur-[10px]"
          style={{ background: "rgba(109,91,208,0.25)" }}
        />
        <div className="relative mb-3 text-4xl">🧭</div>
        <h1 className="relative text-[22px] font-extrabold tracking-tight">
          나에게 맞는 국제기구 찾기
        </h1>
        <p className="relative mx-auto mt-2 max-w-[460px] text-sm leading-relaxed text-white/70">
          국제기구가 너무 많아 막막한가요? 9개 질문이면 나침반이 당신에게 맞는
          기구를 가리켜드려요.
        </p>
      </div>

      {/* Form */}
      <div className="border-border bg-card rounded-[18px] border p-5 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h2 className="text-foreground text-sm font-extrabold">기본 정보</h2>
          <span className="text-muted-foreground text-[11px]">
            선택 입력 · 채울수록 추천이 정확해져요
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="전공 / 관심 학문">
            <input
              className={controlClass}
              placeholder="예: 환경학"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </Field>
          <Field label="학력">
            <select
              className={controlClass}
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
            >
              <option value="">선택 안 함</option>
              <option>고등학교 재학</option>
              <option>학부 재학</option>
              <option>학사 졸업</option>
              <option>석사 이상</option>
            </select>
          </Field>
          <Field label="국제기구·관련 경험">
            <select
              className={controlClass}
              value={exp}
              onChange={(e) => setExp(e.target.value)}
            >
              <option value="">선택 안 함</option>
              <option>없음</option>
              <option>동아리·공모전</option>
              <option>인턴십</option>
              <option>실무 경력</option>
            </select>
          </Field>
          <Field label="영어 수준">
            <select
              className={controlClass}
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
            >
              <option value="">선택 안 함</option>
              <option>일상 회화 가능</option>
              <option>업무 이메일·문서 작성 가능</option>
              <option>회의·발표·협상 등 자유로운 업무 수행</option>
            </select>
          </Field>
          <Field label="제2외국어">
            <div className="flex gap-2">
              <select
                className={controlClass}
                value={secondRaw}
                onChange={(e) => setSecondRaw(e.target.value)}
              >
                <option value="">선택 안 함</option>
                {SECOND_LANGS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              {secondRaw === "기타" && (
                <input
                  className={controlClass}
                  placeholder="어떤 언어?"
                  value={etc}
                  onChange={(e) => setEtc(e.target.value)}
                />
              )}
            </div>
          </Field>
        </div>

        <Button
          onClick={start}
          className="bg-point hover:bg-point-hover mt-6 h-auto w-full rounded-xl py-3.5 text-[15px] font-extrabold"
        >
          진단 시작하기 →
        </Button>
      </div>
    </div>
  );
}
