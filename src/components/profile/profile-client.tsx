"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EMPTY_PROFILE,
  ENGLISH_OPTIONS,
  EXPERIENCE_OPTIONS,
  EXPERIENCE_TYPE_OPTIONS,
  LANGUAGE_LEVEL_OPTIONS,
  LANGUAGE_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/compass/flows";
import {
  loadCompassProfile,
  saveCompassProfile,
} from "@/lib/compass/profile-store";
import type { ProfileSummary } from "@/lib/compass/types";
import { cn } from "@/lib/utils";

// 마이페이지 프로필 = 나침반과 동일한 정본(ProfileSummary 9필드)을 편집한다.
// 여기서 저장하면 나침반 재방문 시 "불러오기"로 그대로 이어서 진단할 수 있다(양방향).
export function ProfileClient() {
  const [profile, setProfile] = useState<ProfileSummary>(EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await loadCompassProfile();
      if (p) setProfile(p);
    })();
  }, []);

  const set = <K extends keyof ProfileSummary>(
    key: K,
    value: ProfileSummary[K],
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  // 나침반 대화형 입력과 동일한 조건부 노출 규칙을 화면에도 적용한다.
  const isGraduate =
    profile.status === "석사 재학" || profile.status === "석사 이상";
  const usesSecondLanguage =
    !!profile.second_language && profile.second_language !== "없음";

  const save = async () => {
    setSaved(false);
    const res = await saveCompassProfile(profile);
    if (res.ok) {
      setSaved(true);
      setNeedLogin(false);
    } else if (res.error === "not_authenticated") {
      setNeedLogin(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-6 py-8">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h1 className="text-foreground text-xl font-bold">내 프로필</h1>
      </div>
      <p className="text-muted-foreground mb-5 text-xs">
        여기서 저장한 내용은 나침반 진단에도 그대로 이어져요.
      </p>

      <div className="flex flex-col gap-4">
        <TextField
          label="호칭"
          value={profile.nickname}
          onChange={(v) => set("nickname", v)}
          placeholder="닉네임이나 이름"
        />

        <SectionTitle>학업</SectionTitle>
        <SelectField
          label="학업 단계"
          value={profile.status}
          onChange={(v) => set("status", v)}
          options={STATUS_OPTIONS.map((o) => ({ value: o, label: o }))}
        />
        <TextField
          label="학부 전공"
          value={profile.bachelor_major}
          onChange={(v) => set("bachelor_major", v)}
          placeholder="예: 정치외교학"
        />
        {isGraduate && (
          <>
            <TextField
              label="석사 전공"
              value={profile.graduate_major}
              onChange={(v) => set("graduate_major", v)}
              placeholder="예: 국제협력학"
            />
            <TextField
              label="연구 주제"
              value={profile.research_topic}
              onChange={(v) => set("research_topic", v)}
              placeholder="예: 기후변화 적응 정책"
            />
          </>
        )}
        <TextField
          label="졸업(예정) 시기"
          value={profile.graduation_timing}
          onChange={(v) => set("graduation_timing", v)}
          placeholder="예: 2027-02"
        />

        <SectionTitle>관련 경험</SectionTitle>
        <ChipsField
          label="경험 종류 (여러 개 선택 가능)"
          value={profile.experience_types}
          onChange={(v) => set("experience_types", v)}
          options={EXPERIENCE_TYPE_OPTIONS}
        />
        <SelectField
          label="경험 기간"
          value={profile.experience_years}
          onChange={(v) => set("experience_years", v)}
          options={EXPERIENCE_OPTIONS.map((o) => ({ value: o, label: o }))}
        />
        <TextField
          label="경험 설명"
          value={profile.experience_detail}
          onChange={(v) => set("experience_detail", v)}
          placeholder="예: 환경 NGO에서 캠페인 기획 6개월"
        />

        <SectionTitle>언어</SectionTitle>
        <SelectField
          label="영어 수준"
          value={profile.english_level}
          onChange={(v) => set("english_level", v)}
          options={ENGLISH_OPTIONS.map((o) => ({ value: o, label: o }))}
        />
        <TextField
          label="영어 자격증"
          value={profile.english_cert}
          onChange={(v) => set("english_cert", v)}
          placeholder="예: TOEIC 900 · 없으면 비워두세요"
        />
        <SelectField
          label="제2외국어"
          value={profile.second_language}
          onChange={(v) => set("second_language", v)}
          options={LANGUAGE_OPTIONS.map((o) => ({ value: o, label: o }))}
        />
        {usesSecondLanguage && (
          <>
            <SelectField
              label="제2외국어 수준"
              value={profile.second_language_level}
              onChange={(v) => set("second_language_level", v)}
              options={LANGUAGE_LEVEL_OPTIONS.map((o) => ({
                value: o,
                label: o,
              }))}
            />
            <TextField
              label="제2외국어 자격증"
              value={profile.second_language_cert}
              onChange={(v) => set("second_language_cert", v)}
              placeholder="예: DELF B2 · 없으면 비워두세요"
            />
          </>
        )}

        <SectionTitle>관심사</SectionTitle>
        <p className="text-muted-foreground -mt-2 text-[11px]">
          아래 두 항목은 나침반 진단을 마치면 답변을 바탕으로 자동으로 채워져요.
          직접 고쳐 적으셔도 괜찮아요.
        </p>
        <TextField
          label="관심 분야"
          value={profile.target_field}
          onChange={(v) => set("target_field", v)}
          placeholder="예: 환경, 인권"
        />
        <TextField
          label="진출 경로"
          value={profile.target_path}
          onChange={(v) => set("target_path", v)}
          placeholder="예: 인턴십, JPO"
        />

        <div className="border-border mt-1 flex items-center gap-3 border-t pt-4">
          <Button onClick={save} className="self-start">
            저장
          </Button>
          {saved && (
            <span className="text-point-hover text-xs font-semibold">
              저장됐어요 · 나침반에도 반영돼요 ✅
            </span>
          )}
          {needLogin && (
            <span className="text-destructive text-xs font-semibold">
              로그인해야 저장할 수 있어요.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-foreground border-border mt-2 border-t pt-4 text-sm font-bold">
      {children}
    </h2>
  );
}

/**
 * 복수 선택 필드. 값은 나침반 대화형 입력과 동일하게 ", "로 이어 붙인
 * 한 문자열로 보관하여 두 화면이 같은 데이터를 그대로 주고받는다.
 */
function ChipsField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const picked = value ? value.split(", ").filter(Boolean) : [];
  const toggle = (o: string) => {
    // "없음"은 배타 선택 — 나침반 대화형 입력과 동일한 규칙.
    if (o === "없음") {
      onChange(picked.includes(o) ? "" : "없음");
      return;
    }
    const rest = picked.filter((v) => v !== "없음");
    const next = rest.includes(o) ? rest.filter((v) => v !== o) : [...rest, o];
    onChange(next.join(", "));
  };
  return (
    <div className="text-muted-foreground text-xs font-semibold">
      {label}
      <div className="mt-1.5 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={cn(
              "rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-medium transition",
              picked.includes(o)
                ? "border-point bg-point-soft text-foreground"
                : "border-border text-muted-foreground hover:border-point",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="text-muted-foreground text-xs font-semibold">
      {label}
      <Input
        className="mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "선택",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <label className="text-muted-foreground text-xs font-semibold">
      {label}
      <div className="relative mt-1">
        {/* Input 컴포넌트와 동일한 테두리·radius·패딩으로 높이를 맞춘다 */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "border-border text-foreground focus:border-point aria-invalid:border-destructive w-full cursor-pointer appearance-none rounded-[11px] border-[1.5px] bg-transparent px-3.5 py-3 pr-10 text-sm outline-none",
            !value && "text-muted-foreground",
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-foreground">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2" />
      </div>
    </label>
  );
}
