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

      <div className="flex flex-col gap-6">
        {/* 기본 정보 */}
        <div>
          <h2 className="text-foreground border-border mb-3 border-b pb-1 text-sm font-bold">
            기본 정보
          </h2>
          <div className="flex flex-col gap-4">
            <TextField
              label="닉네임"
              value={profile.nickname}
              onChange={(v) => set("nickname", v)}
              placeholder="예: 홍길동"
            />
            <SelectField
              label="현재 상태"
              value={profile.status}
              onChange={(v) => set("status", v)}
              options={STATUS_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
            <SelectField
              label="국제기구 친숙도"
              value={profile.familiarity}
              onChange={(v) => set("familiarity", v)}
              options={[
                { value: "거의 모른다", label: "거의 모른다" },
                { value: "이름만 들어봤다", label: "이름만 들어봤다" },
                { value: "몇 곳은 알고 있다", label: "몇 곳은 알고 있다" },
              ]}
            />
          </div>
        </div>

        {/* 학업 및 전공 */}
        <div>
          <h2 className="text-foreground border-border mb-3 border-b pb-1 text-sm font-bold">
            학업 및 전공
          </h2>
          <div className="flex flex-col gap-4">
            <TextField
              label="관심 주제 / 전공 (흥미 트랙)"
              value={profile.interest_hint}
              onChange={(v) => set("interest_hint", v)}
              placeholder="예: 경제학, 환경, 국제뉴스, 아직 없음"
            />
            <TextField
              label="학사 전공 (고급 트랙)"
              value={profile.bachelor_major}
              onChange={(v) => set("bachelor_major", v)}
              placeholder="예: 환경공학"
            />
            {(profile.status === "석사 재학" ||
              profile.status === "석사 이상") && (
              <>
                <TextField
                  label="석사 전공 (고급 트랙)"
                  value={profile.graduate_major}
                  onChange={(v) => set("graduate_major", v)}
                  placeholder="해당 시 기재 (예: 개발협력)"
                />
                <TextField
                  label="졸업 또는 졸업예정 시기"
                  value={profile.graduation_timing}
                  onChange={(v) => set("graduation_timing", v)}
                  placeholder="예: 2026-02"
                />
              </>
            )}
          </div>
        </div>

        {/* 경력 및 자격 */}
        <div>
          <h2 className="text-foreground border-border mb-3 border-b pb-1 text-sm font-bold">
            경력 및 자격
          </h2>
          <div className="flex flex-col gap-4">
            <SelectField
              label="관련 경력"
              value={profile.experience_years}
              onChange={(v) => set("experience_years", v)}
              options={EXPERIENCE_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
            <TextField
              label="자격증"
              value={profile.cert}
              onChange={(v) => set("cert", v)}
              placeholder="예: 정보처리기사, 없음"
            />
            <SelectField
              label="진출 경로"
              value={profile.target_path}
              onChange={(v) => set("target_path", v)}
              options={PATH_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
          </div>
        </div>

        {/* 외국어 능력 */}
        <div>
          <h2 className="text-foreground border-border mb-3 border-b pb-1 text-sm font-bold">
            외국어 능력
          </h2>
          <div className="flex flex-col gap-4">
            <SelectField
              label="영어 업무 수행 수준"
              value={profile.english_level}
              onChange={(v) => set("english_level", v)}
              options={ENGLISH_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
            <TextField
              label="제2외국어"
              value={profile.second_language}
              onChange={(v) => set("second_language", v)}
              placeholder="예: 프랑스어 B1, 없음"
            />
          </div>
        </div>

        {/* 관심 분야 */}
        <div>
          <h2 className="text-foreground border-border mb-3 border-b pb-1 text-sm font-bold">
            관심 분야
          </h2>
          <div className="flex flex-col gap-4">
            <TextField
              label="관심 분야"
              value={profile.target_field}
              onChange={(v) => set("target_field", v)}
              placeholder="예: 환경·기후, 개발협력, 인권"
            />
          </div>
        </div>

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
