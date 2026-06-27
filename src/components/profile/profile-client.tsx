"use client";

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronLeft, X } from "lucide-react";

import { ConnBadge, type ConnState } from "@/components/common/conn-badge";
import { Input } from "@/components/ui/input";
import { getProfile, updateProfile } from "@/lib/api/iogo";
import { getUserId } from "@/lib/api/user";

// 학력 옵션 — 나침반(ProfileIntro)의 학력 select와 동일하게 맞춘다.
const EDUCATION_OPTIONS = [
  "고등학교 재학",
  "학부 재학",
  "학사 졸업",
  "석사 이상",
];

// ===== 섹션 카드 =====
function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-border bg-card rounded-[18px] border p-5">
      <h2 className="text-foreground text-[15px] font-extrabold">{title}</h2>
      {desc && <p className="text-muted-foreground mt-0.5 text-xs">{desc}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs font-semibold">
        {label}
      </span>
      {children}
    </label>
  );
}

// 콤마/엔터로 항목을 추가하는 태그 입력 — jsonb 배열 컬럼에 매핑.
function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
  };

  // 입력값 변경 처리 — 콤마가 포함되면 잘라서 태그로 추가한다.
  // (keydown 대신 여기서 처리해야 한글 IME 조합 중 입력된 콤마도 잡힌다.)
  const onChangeDraft = (val: string) => {
    if (!val.includes(",")) {
      setDraft(val);
      return;
    }
    const parts = val.split(",");
    const last = parts.pop() ?? "";
    const next = [...values];
    for (const p of parts) {
      const v = p.trim();
      if (v && !next.includes(v)) next.push(v);
    }
    onChange(next);
    setDraft(last);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중 Enter는 글자 확정용이므로 무시한다(중복/잔여 글자 방지).
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      add(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs font-semibold">
        {label}
        <span className="text-muted-foreground/60 ml-1.5 font-normal">
          Enter 또는 , 로 추가
        </span>
      </span>
      <div className="border-input focus-within:border-point-border focus-within:ring-ring/30 flex flex-wrap items-center gap-1.5 rounded-md border bg-transparent p-1.5 transition-[color,box-shadow] focus-within:ring-3">
        {values.map((v) => (
          <span
            key={v}
            className="bg-point-soft text-point-hover inline-flex items-center gap-1 rounded-md py-1 pr-1 pl-2 text-xs font-semibold"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="hover:bg-point-border/60 text-point-hover/70 hover:text-point-hover flex size-4 items-center justify-center rounded transition-colors"
              aria-label={`${v} 삭제`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => onChangeDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (draft.trim()) {
              add(draft);
              setDraft("");
            }
          }}
          placeholder={values.length ? "" : placeholder}
          className="placeholder:text-muted-foreground min-w-[10ch] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
        />
      </div>
    </div>
  );
}

export function ProfileClient() {
  const [state, setState] = useState<ConnState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [education, setEducation] = useState("");
  const [major, setMajor] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [targetOrgs, setTargetOrgs] = useState<string[]>([]);
  const [targetRegion, setTargetRegion] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      const id = await getUserId();
      setUserId(id);
      try {
        const p = await getProfile(id, { signal: ctrl.signal });
        setEducation(p.education ?? "");
        setMajor(p.major ?? "");
        setLanguages(p.languages ?? []);
        setInterests(p.interests ?? []);
        setExperience(p.experience ?? []);
        setTargetOrgs(p.target_orgs ?? []);
        setTargetRegion(p.target_region ?? "");
        setState("ok");
      } catch (e: unknown) {
        if (ctrl.signal.aborted) return;
        // 404(프로필 없음)도 "연결됨"으로 본다 — 백엔드는 응답했으므로.
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("404")) {
          setState("ok");
        } else {
          setError(msg);
          setState("error");
        }
      }
    })();
    return () => ctrl.abort();
  }, []);

  const save = async () => {
    setSaving(true);
    setJustSaved(false);
    try {
      await updateProfile(userId, {
        education,
        major,
        languages,
        interests,
        experience,
        target_orgs: targetOrgs,
        target_region: targetRegion,
      });
      setState("ok");
      setError(null);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2400);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setState("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[640px] px-6 py-8">
      <Link
        href="/mypage"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
      >
        <ChevronLeft className="size-4" />
        마이페이지
      </Link>

      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-primary text-2xl font-extrabold tracking-tight">
            프로필 수정
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            정보를 채울수록 더 잘 맞는 공고와 인사이트를 추천해 드려요.
          </p>
        </div>
        <ConnBadge state={state} error={error} />
      </div>

      <div className="flex flex-col gap-3.5">
        <Section title="기본 정보">
          <Field label="학력">
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="border-border text-foreground focus:border-point aria-[invalid]:border-destructive data-[empty=true]:text-muted-foreground w-full rounded-[11px] border-[1.5px] bg-white px-3.5 py-3 text-sm outline-none"
              data-empty={education === ""}
            >
              <option value="">선택 안 함</option>
              {EDUCATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="전공">
            <Input
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="예: 국제학"
            />
          </Field>
        </Section>

        <Section title="역량" desc="언어·관심 분야·경험을 태그로 정리해요.">
          <TagInput
            label="구사 언어"
            values={languages}
            onChange={setLanguages}
            placeholder="예: 한국어, 영어(상), 프랑스어(중)"
          />
          <TagInput
            label="관심 분야"
            values={interests}
            onChange={setInterests}
            placeholder="예: 인권, 기후, 개발협력"
          />
          <TagInput
            label="관련 경험"
            values={experience}
            onChange={setExperience}
            placeholder="예: NGO 인턴, 해외봉사, 모의유엔"
          />
        </Section>

        <Section title="목표" desc="가고 싶은 기구와 지역을 알려주세요.">
          <TagInput
            label="목표 기구"
            values={targetOrgs}
            onChange={setTargetOrgs}
            placeholder="예: UNHCR, UNDP, WHO"
          />
          <Field label="희망 근무 지역">
            <Input
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              placeholder="예: 제네바, 아시아·태평양, 본부 무관"
            />
          </Field>
        </Section>
      </div>

      {/* Save bar */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || state === "loading"}
          className="bg-primary hover:bg-point-hover rounded-[11px] px-5 py-2.5 text-[13px] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "저장 중…" : "변경사항 저장"}
        </button>
        {justSaved && (
          <span className="text-point-hover inline-flex items-center gap-1 text-sm font-semibold">
            <Check className="size-4" />
            저장됐어요
          </span>
        )}
        {state === "error" && error && (
          <span className="text-destructive text-sm font-medium">
            저장 실패 — 다시 시도해 주세요.
          </span>
        )}
      </div>
    </div>
  );
}
