"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EMPTY_PROFILE,
  ENGLISH_OPTIONS,
  EXPERIENCE_OPTIONS,
  PATH_OPTIONS,
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
        <SelectField
          label="현재 상태"
          value={profile.status}
          onChange={(v) => set("status", v)}
          options={STATUS_OPTIONS.map((o) => ({ value: o, label: o }))}
        />
        <TextField
          label="관심 주제"
          value={profile.interest_hint}
          onChange={(v) => set("interest_hint", v)}
          placeholder="예: 국제학 · 기후"
        />
        <TextField
          label="학사 전공"
          value={profile.bachelor_major}
          onChange={(v) => set("bachelor_major", v)}
          placeholder="예: 정치외교학"
        />
        <SelectField
          label="영어 수준"
          value={profile.english_level}
          onChange={(v) => set("english_level", v)}
          options={ENGLISH_OPTIONS.map((o) => ({ value: o, label: o }))}
        />
        <SelectField
          label="관련 경력"
          value={profile.experience_years}
          onChange={(v) => set("experience_years", v)}
          options={EXPERIENCE_OPTIONS.map((o) => ({ value: o, label: o }))}
        />
        <TextField
          label="제2외국어"
          value={profile.second_language}
          onChange={(v) => set("second_language", v)}
          placeholder="예: 프랑스어(중급)"
        />
        <TextField
          label="자격증"
          value={profile.cert}
          onChange={(v) => set("cert", v)}
          placeholder="예: 정보처리기사"
        />
        <SelectField
          label="진출 경로"
          value={profile.target_path}
          onChange={(v) => set("target_path", v)}
          options={PATH_OPTIONS.map((o) => ({ value: o, label: o }))}
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
