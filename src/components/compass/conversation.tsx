"use client";

import { ChevronUp, Pencil, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  BRANCH,
  EMPTY_PROFILE,
  flowFor,
  shouldSkipStep,
  type ProfileStep,
} from "@/lib/compass/flows";
import { loadCompassProfile } from "@/lib/compass/profile-store";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { CompassTrack, ProfileSummary } from "@/lib/compass/types";
import { cn } from "@/lib/utils";

// 프로필 입력을 마친 뒤 한 번 묻는 "마이페이지 저장" 단계

// 트랙 선택 직후, 저장된 프로필이 있을 때 한 번 묻는 "불러오기" 단계
const LOAD_ASK =
  "저장된 프로필 정보가 있어요. 그 내용을 불러와서 채워둘까요? 불러온 뒤에도 각 항목은 수정할 수 있어요.";

// 완료된 한 턴(질문 하나에 대한 답). 순서: branch → profile[…] → save
// (진단 퀴즈는 대화가 끝난 뒤 별도 스텝 화면(quiz.tsx)에서 진행한다)
type Turn =
  | { phase: "branch"; track: CompassTrack; display: string }
  | { phase: "profile"; idx: number; value: string; display: string }
  | { phase: "save"; value: boolean; display: string };

// 지금 물어볼(대기 중) 스텝
type Pending =
  | { kind: "branch" }
  | { kind: "profile"; idx: number; step: ProfileStep }
  | { kind: "save" }
  | null;

// 화면 전환 없이 같은 화면에 대화가 누적되는 단계 진행 UI(말풍선).
// 실제 채팅이 아니라 정해진 질문(정보입력)을 순서대로 진행한다.
// 이미 답한 말풍선은 "수정"으로 되돌아가 다시 고칠 수 있다.
// 정보입력(branch→profile→save)이 끝나면 onFinish로 넘겨 퀴즈 화면으로 전환한다.
export function Conversation({
  onFinish,
}: {
  onFinish: (
    profile: ProfileSummary,
    track: CompassTrack,
    saveToMypage: boolean,
  ) => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  // 수정 중인 턴 인덱스(null = 새 답변 입력 모드)
  const [editing, setEditing] = useState<number | null>(null);

  // ── 로그인 유저 확인 및 재방문자 저장된 정본 프로필 불러오기 ──
  const [user, setUser] = useState<User | null>(null);
  const [savedProfile, setSavedProfile] = useState<ProfileSummary | null>(null);
  const [loadAsked, setLoadAsked] = useState(false);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (alive) setUser(user);
    });
    loadCompassProfile().then((p) => {
      if (alive) setSavedProfile(p && p.track ? p : null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const saveAskText = user
    ? "여기까지 입력한 정보를 마이페이지에 저장할까요? 저장해두면 다음엔 다시 안 적어도 돼요."
    : "여기까지 입력한 정보를 마이페이지에 저장해둘까요? 저장해두면 다음엔 다시 안 적어도 돼요. 저장하려면 로그인이 필요해요.";

  const saveOptions = useMemo(() => {
    return user
      ? [
          { t: "네, 저장할게요", value: true },
          { t: "아니요, 이번만 볼게요", value: false },
        ]
      : [
          { t: "로그인하고 저장하기", value: true },
          { t: "로그인 없이 결과 보기", value: false },
        ];
  }, [user]);

  const track = turns[0]?.phase === "branch" ? turns[0].track : null;
  const flow = track ? flowFor(track) : null;

  // 대기 중인 다음 스텝 계산 (branch → profile[…] → save)
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const pending = useMemo<Pending>(() => {
    if (turns.length === 0) return { kind: "branch" };
    if (!flow) return null;

    // 현재까지 입력된 프로필 정보 수집
    const currentProfile: ProfileSummary = {
      ...EMPTY_PROFILE,
      track: track || "",
    };
    turns.forEach((t) => {
      if (t.phase === "profile") {
        const step = flow.profile[t.idx];
        if (step) currentProfile[step.key] = t.value;
      }
    });

    // 아직 답하지 않은 첫 번째 유효한 프로필 스텝 찾기
    for (let i = 0; i < flow.profile.length; i++) {
      const step = flow.profile[i];
      const alreadyAnswered = turns.some(
        (t) => t.phase === "profile" && t.idx === i,
      );
      if (alreadyAnswered) continue;

      // 스킵해야 하는 경우 건너뜀
      if (shouldSkipStep(step.key, currentProfile)) {
        continue;
      }

      return { kind: "profile", idx: i, step };
    }

    // 모든 프로필 스텝 완료/스킵 시 save 질문
    const hasSave = turns.some((t) => t.phase === "save");
    if (!hasSave) return { kind: "save" };

    return null;
  }, [turns, flow, track]);

  // 유효한(스킵되지 않은) 전체 스텝 수 및 현재 스텝 인덱스 계산
  const { activeSteps, currentStepIndex } = useMemo(() => {
    if (!flow) return { activeSteps: 0, currentStepIndex: 0 };

    // 현재까지 입력된 프로필 정보 수집
    const currentProfile: ProfileSummary = {
      ...EMPTY_PROFILE,
      track: track || "",
    };
    turns.forEach((t) => {
      if (t.phase === "profile") {
        const step = flow.profile[t.idx];
        if (step) currentProfile[step.key] = t.value;
      }
    });

    const active = flow.profile.filter(
      (step) => !shouldSkipStep(step.key, currentProfile),
    );
    let currentIndex = active.length;
    if (pending?.kind === "profile") {
      currentIndex = active.findIndex((step) => step.key === pending.step.key);
      if (currentIndex === -1) currentIndex = active.length;
    }
    return { activeSteps: active.length, currentStepIndex: currentIndex };
  }, [flow, pending, turns, track]);

  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // 위로 밀려난(이전) 메시지가 있는지 — "이전 메시지 보기" 표시용
  const [canScrollUp, setCanScrollUp] = useState(false);

  useEffect(() => {
    // 수정 중이 아닐 때만 맨 아래(최신)로 스크롤
    if (editing == null)
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, editing]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) setCanScrollUp(el.scrollTop > 8);
  };
  const scrollToTop = () =>
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  // turns → 최종 프로필 + 저장 동의 여부
  const collect = (all: Turn[], tk: CompassTrack) => {
    const f = flowFor(tk);
    const profile: ProfileSummary = { ...EMPTY_PROFILE, track: tk };
    let saveToMypage = false;
    all.forEach((t) => {
      if (t.phase === "profile") {
        const step = f.profile[t.idx];
        if (step && !shouldSkipStep(step.key, profile)) {
          profile[step.key] = t.value;
        }
      } else if (t.phase === "save") saveToMypage = t.value;
    });
    return { profile, saveToMypage };
  };

  const maybeFinish = (all: Turn[], tk: CompassTrack) => {
    const hasSave = all.some((t) => t.phase === "save");
    if (hasSave) {
      const { profile, saveToMypage } = collect(all, tk);
      onFinish(profile, tk, saveToMypage);
    }
  };

  // ── 답변 처리 ──
  const pickBranch = (opt: (typeof BRANCH.opts)[number]) => {
    if (editing === 0) {
      // 첫 질문 수정: 트랙이 바뀌면 이후 답변은 초기화(문항 은행이 다름)
      const cur = track;
      if (opt.track === cur) {
        setTurns((prev) => {
          const next = prev.slice();
          next[0] = { phase: "branch", track: opt.track, display: opt.t };
          return next;
        });
      } else {
        setTurns([{ phase: "branch", track: opt.track, display: opt.t }]);
        setLoadAsked(false); // 트랙이 바뀌면 불러오기를 다시 묻는다
      }
      setEditing(null);
      return;
    }
    setTurns([{ phase: "branch", track: opt.track, display: opt.t }]);
  };

  // ── 재방문: 저장 프로필 불러오기 ──
  // 저장 프로필을 "선택한 트랙"의 profile 턴으로 채운다(공통 키 기준).
  const seedFromSaved = (tk: CompassTrack, p: ProfileSummary): Turn[] =>
    flowFor(tk).profile.map((step, idx) => {
      const value = (p[step.key] as string) ?? "";
      return { phase: "profile", idx, value, display: value || "(미입력)" };
    });

  const acceptLoad = () => {
    if (!track || !savedProfile) return;
    setTurns((prev) => [prev[0], ...seedFromSaved(track, savedProfile)]);
    setLoadAsked(true);
  };
  const skipLoad = () => setLoadAsked(true);

  const answerProfile = (value: string, display: string) => {
    if (!flow) return;
    if (editing != null) {
      setTurns((prev) => {
        const next = prev.slice();
        const t = next[editing];
        if (t.phase === "profile") next[editing] = { ...t, value, display };
        return next;
      });
      setEditing(null);
      return;
    }
    if (pending?.kind !== "profile") return;
    const next: Turn[] = [
      ...turns,
      { phase: "profile", idx: pending.idx, value, display },
    ];
    setTurns(next);
    if (track) maybeFinish(next, track);
  };

  const answerSave = (value: boolean, display: string) => {
    if (!flow) return;
    if (editing != null) {
      if (!user && value) {
        if (track) {
          const tempTurns = turns.slice();
          tempTurns[editing] = { phase: "save", value, display };
          const { profile } = collect(tempTurns, track);
          try {
            sessionStorage.setItem(
              "iogo_pending_compass_profile",
              JSON.stringify({ profile, track }),
            );
          } catch (e) {
            console.error("Failed to save pending profile", e);
          }
          window.location.href = `/login?next=${encodeURIComponent("/compass")}`;
        }
        return;
      }

      setTurns((prev) => {
        const next = prev.slice();
        const t = next[editing];
        if (t.phase === "save") next[editing] = { ...t, value, display };
        return next;
      });
      setEditing(null);

      const nextTurns = turns.slice();
      nextTurns[editing] = { phase: "save", value, display };
      if (track) maybeFinish(nextTurns, track);
      return;
    }
    if (pending?.kind !== "save") return;
    const next: Turn[] = [...turns, { phase: "save", value, display }];

    if (!user && value) {
      if (track) {
        const { profile } = collect(next, track);
        try {
          sessionStorage.setItem(
            "iogo_pending_compass_profile",
            JSON.stringify({ profile, track }),
          );
        } catch (e) {
          console.error("Failed to save pending profile", e);
        }
        window.location.href = `/login?next=${encodeURIComponent("/compass")}`;
      }
      return;
    }

    setTurns(next);
    if (track) maybeFinish(next, track);
  };

  // 턴의 질문 텍스트
  const askOf = (t: Turn): string => {
    if (t.phase === "branch") return BRANCH.ask;
    if (t.phase === "save") return saveAskText;
    if (!flow) return "";
    return flow.profile[t.idx].ask;
  };

  // 유효한(스킵되지 않은) turns만 필터링
  const activeTurns = useMemo(() => {
    const currentProfileMap: Partial<ProfileSummary> = {};
    const result: { turn: Turn; originalIndex: number }[] = [];

    turns.forEach((t, i) => {
      if (t.phase === "branch") {
        result.push({ turn: t, originalIndex: i });
      } else if (t.phase === "profile") {
        if (!flow) return;
        const step = flow.profile[t.idx];
        if (step && !shouldSkipStep(step.key, currentProfileMap)) {
          currentProfileMap[step.key] = t.value;
          result.push({ turn: t, originalIndex: i });
        }
      } else if (t.phase === "save") {
        result.push({ turn: t, originalIndex: i });
      }
    });
    return result;
  }, [turns, flow]);

  // 트랙 선택 직후, 저장 프로필이 있으면 "불러올까요?"를 먼저 묻는다.
  const askLoad =
    editing == null &&
    !loadAsked &&
    !!savedProfile &&
    !!track &&
    turns.length === 1;

  return (
    <div className="mx-auto flex max-w-[960px] items-end justify-center gap-4 lg:gap-6">
      <div className="w-full max-w-[720px]">
        {/* 진행 표시 */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-point-hover">
              {track
                ? track === "interest"
                  ? "흥미·입문"
                  : "고급·정보취득"
                : "나침반 진단"}
            </span>
            {flow && (
              <span className="text-muted-foreground tabular-nums">
                {Math.min(
                  currentStepIndex +
                    (pending && pending.kind === "profile" ? 1 : 0),
                  activeSteps,
                )}{" "}
                / {activeSteps}
              </span>
            )}
          </div>
          <div className="bg-secondary h-2 overflow-hidden rounded-full">
            <div
              className="bg-point h-full rounded-full transition-all duration-300"
              style={{
                width: `${activeSteps ? (currentStepIndex / activeSteps) * 100 : 4}%`,
              }}
            />
          </div>
        </div>

        {/* 대화 로그 — 창 고정(스크롤), 위로 밀려난 메시지는 상단 그라데이션으로 흐릿 */}
        <div className="border-border bg-card relative flex h-[68vh] max-h-[720px] min-h-[440px] flex-col overflow-hidden rounded-[18px] border">
          <div className="relative min-h-0 flex-1">
            {/* 상단 페이드 그라데이션 — 위로 밀려난 메시지가 있을 때만 */}
            <div
              className={cn(
                "from-card via-card/70 pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b to-transparent transition-opacity duration-200",
                canScrollUp ? "opacity-100" : "opacity-0",
              )}
            />

            {/* 이전 메시지 보기 */}
            {canScrollUp && (
              <button
                type="button"
                onClick={scrollToTop}
                className="border-border text-muted-foreground hover:text-foreground absolute top-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-white/90 px-3 py-1 text-[11px] font-semibold shadow-sm backdrop-blur transition"
              >
                <ChevronUp className="size-3" />
                이전 메시지 보기
              </button>
            )}

            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="h-full overflow-y-auto px-4 pt-5 pb-4 sm:px-5"
            >
              {/* min-h-full + justify-end → 대화가 창 아래에서부터 쌓인다 */}
              <div className="flex min-h-full flex-col justify-end gap-3">
                {/* 첫 인사 */}
                <BotBubble text={BRANCH.ask} />

                {activeTurns.map(({ turn: t, originalIndex: i }) => {
                  if (t.phase === "branch") {
                    // 첫 질문의 답
                    return editing === 0 ? (
                      <BranchInput
                        key="branch-edit"
                        current={t.track}
                        editing
                        onPick={pickBranch}
                        onCancel={() => setEditing(null)}
                      />
                    ) : (
                      <UserBubble
                        key="branch"
                        text={t.display}
                        onEdit={() => setEditing(0)}
                      />
                    );
                  }
                  return (
                    <div key={i} className="flex flex-col gap-3">
                      <BotBubble text={askOf(t)} />
                      {editing === i ? (
                        t.phase === "profile" && flow ? (
                          <ProfileInput
                            step={flow.profile[t.idx]}
                            initial={t.value}
                            editing
                            onAnswer={answerProfile}
                            onCancel={() => setEditing(null)}
                          />
                        ) : t.phase === "save" ? (
                          <SaveInput
                            options={saveOptions}
                            initial={t.value}
                            editing
                            onAnswer={answerSave}
                            onCancel={() => setEditing(null)}
                          />
                        ) : null
                      ) : (
                        <UserBubble
                          text={t.display}
                          onEdit={() => setEditing(i)}
                        />
                      )}
                    </div>
                  );
                })}

                {/* 대기 중 질문(수정 모드가 아닐 때만) */}
                {askLoad ? (
                  <BotBubble text={LOAD_ASK} />
                ) : (
                  editing == null &&
                  pending &&
                  pending.kind !== "branch" && (
                    <BotBubble
                      text={
                        pending.kind === "save" ? saveAskText : pending.step.ask
                      }
                    />
                  )
                )}
                <div ref={endRef} />
              </div>
            </div>
          </div>

          {/* 불러오기 여부 — 트랙 선택 직후 1회 */}
          {askLoad && (
            <div className="border-border bg-card border-t px-4 py-4 sm:px-5">
              <LoadInput onAccept={acceptLoad} onSkip={skipLoad} />
            </div>
          )}

          {/* 입력 영역 — 카드 하단 고정 */}
          {!askLoad && editing == null && pending && (
            <div className="border-border bg-card border-t px-4 py-4 sm:px-5">
              {pending.kind === "branch" && <BranchInput onPick={pickBranch} />}
              {pending.kind === "profile" && (
                <ProfileInput
                  key={`p${pending.idx}`}
                  step={pending.step}
                  onAnswer={answerProfile}
                />
              )}
              {pending.kind === "save" && (
                <SaveInput options={saveOptions} onAnswer={answerSave} />
              )}
            </div>
          )}

          {editing == null && !pending && (
            <p className="text-muted-foreground border-border border-t py-4 text-center text-sm">
              다음 단계(진단 퀴즈)로 넘어가고 있어요…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== 재방문: 저장 프로필 불러오기 여부(트랙 선택 직후 1회) =====
function LoadInput({
  onAccept,
  onSkip,
}: {
  onAccept: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <button type="button" onClick={onAccept} className={cn(optBase, optOff)}>
        네, 불러올게요
      </button>
      <button type="button" onClick={onSkip} className={cn(optBase, optOff)}>
        아니요, 새로 입력할게요
      </button>
    </div>
  );
}

// ===== 말풍선 =====
function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex animate-[pol-up_0.3s_ease] items-end gap-2">
      <span className="bg-point-soft relative size-12 shrink-0 overflow-hidden rounded-full">
        <Image
          src="/mascot_default.png"
          alt="I-OGO 나침반"
          fill
          sizes="36px"
          className="object-cover"
          style={{ objectPosition: "50% 20%" }}
        />
      </span>
      <div className="bg-secondary text-foreground max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed">
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text, onEdit }: { text: string; onEdit: () => void }) {
  return (
    <div className="group flex animate-[pol-up_0.3s_ease] items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={onEdit}
        aria-label="이 답변 수정"
        className="text-muted-foreground hover:text-point flex items-center gap-0.5 text-[11px] font-semibold opacity-60 transition group-hover:opacity-100"
      >
        <Pencil className="size-3" />
        수정
      </button>
      <div className="bg-point rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed font-medium text-white">
        {text}
      </div>
    </div>
  );
}

// ===== 입력 컨트롤 =====
const optBase =
  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition";
const optOn = "border-point bg-point-soft text-foreground";
const optOff = "border-border hover:border-point-border text-foreground";

function CancelEdit({ onCancel }: { onCancel: () => void }) {
  return (
    <button
      type="button"
      onClick={onCancel}
      className="text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-xs font-semibold"
    >
      <X className="size-3.5" />
      취소
    </button>
  );
}

function BranchInput({
  current,
  editing,
  onPick,
  onCancel,
}: {
  current?: CompassTrack;
  editing?: boolean;
  onPick: (opt: (typeof BRANCH.opts)[number]) => void;
  onCancel?: () => void;
}) {
  return (
    <div className={cn(editing && "flex justify-end")}>
      <div className={cn(editing ? "w-full max-w-[80%]" : "")}>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {BRANCH.opts.map((o) => (
            <button
              key={o.t}
              type="button"
              onClick={() => onPick(o)}
              className={cn(optBase, current === o.track ? optOn : optOff)}
            >
              {o.t}
            </button>
          ))}
        </div>
        {editing && onCancel && (
          <div className="mt-2 flex justify-end">
            <CancelEdit onCancel={onCancel} />
          </div>
        )}
      </div>
    </div>
  );
}

function SaveInput({
  options,
  initial,
  editing,
  onAnswer,
  onCancel,
}: {
  options: { t: string; value: boolean }[];
  initial?: boolean;
  editing?: boolean;
  onAnswer: (value: boolean, display: string) => void;
  onCancel?: () => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.t}
            type="button"
            onClick={() => onAnswer(o.value, o.t)}
            className={cn(optBase, initial === o.value ? optOn : optOff)}
          >
            {o.t}
          </button>
        ))}
      </div>
      {editing && onCancel && (
        <div className="mt-2">
          <CancelEdit onCancel={onCancel} />
        </div>
      )}
    </div>
  );
}

function ProfileInput({
  step,
  initial,
  editing,
  onAnswer,
  onCancel,
}: {
  step: ProfileStep;
  initial?: string;
  editing?: boolean;
  onAnswer: (value: string, display: string) => void;
  onCancel?: () => void;
}) {
  const [text, setText] = useState(initial ?? "");

  if (step.kind === "single") {
    return (
      <div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {step.opts.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onAnswer(o, o)}
              className={cn(optBase, initial === o ? optOn : optOff)}
            >
              {o}
            </button>
          ))}
        </div>
        {editing && onCancel && (
          <div className="mt-2">
            <CancelEdit onCancel={onCancel} />
          </div>
        )}
      </div>
    );
  }

  // text
  const submit = () => {
    const v = text.trim();
    if (!v) {
      if (step.optional) onAnswer("", "건너뛰기");
      return;
    }
    onAnswer(v, v);
  };
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        <input
          className="border-border text-foreground placeholder:text-muted-foreground focus-visible:border-point focus-visible:ring-point/30 flex-1 rounded-xl border px-4 py-3 text-sm transition outline-none focus-visible:ring-3"
          placeholder={step.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <Button
          onClick={submit}
          className="bg-point hover:bg-point-hover h-auto shrink-0 rounded-xl px-5 font-semibold text-white"
        >
          확인
        </Button>
        {step.optional && (
          <Button
            type="button"
            onClick={() => onAnswer("", "건너뛰기")}
            className="border-point text-point hover:bg-point/5 hover:text-point h-auto shrink-0 rounded-xl border-[1.5px] bg-white px-5 font-semibold"
          >
            건너뛰기
          </Button>
        )}
      </div>
      {editing && onCancel && (
        <div className="flex items-center gap-3">
          <CancelEdit onCancel={onCancel} />
        </div>
      )}
    </div>
  );
}
