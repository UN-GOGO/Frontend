"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type {
  ProfileSummary,
  Recommendation,
  RecommendResponse,
} from "@/lib/navigator/types";

// 분야 문자열 → 이모지 (표시용)
function iconFor(field?: string) {
  const f = field ?? "";
  const map: [RegExp, string][] = [
    [/보건|의료|건강/, "🏥"],
    [/환경|기후|기상/, "🌍"],
    [/농업|식량|식품/, "🌾"],
    [/인권|난민|이주/, "⚖️"],
    [/교육|문화|과학|지식/, "🎓"],
    [/노동|고용/, "🛠️"],
    [/무역|통상|경제|금융|개발/, "💰"],
    [/원자력|핵/, "⚛️"],
    [/평화|안보|군축/, "🕊️"],
    [/여성|아동|성평등/, "♀️"],
    [/항공/, "✈️"],
    [/해사|해양/, "⚓"],
    [/지식재산|특허/, "💡"],
    [/우편/, "📮"],
  ];
  for (const [re, e] of map) if (re.test(f)) return e;
  return "🌐";
}

function scoreClass(pct: number) {
  if (pct >= 85) return "bg-point text-white";
  if (pct >= 70) return "bg-accent text-point-hover";
  return "bg-secondary text-muted-foreground";
}

const LOADING_MSGS = [
  "프로필을 분석하고 있어요…",
  "36개 국제기구와 비교하고 있어요…",
  "관심 분야·강점을 매칭하고 있어요…",
  "맞춤 조언을 작성하고 있어요…",
];

const PROFILE_LABELS: [keyof ProfileSummary, string][] = [
  ["major", "전공"],
  ["degree", "학력"],
  ["exp", "경험"],
  ["english", "영어"],
  ["second", "제2외국어"],
];

export function Result({
  summary,
  data,
  isAI,
  loading,
  onRetry,
}: {
  summary: ProfileSummary;
  data: RecommendResponse | null;
  isAI: boolean;
  loading: boolean;
  onRetry: () => void;
}) {
  const recs = (data?.recommendations ?? []).slice(0, 3);
  const topScore = recs[0]?.score ?? 60;
  const angle = loading ? 20 : Math.round((topScore / 100) * 60 - 10);
  const nick = summary.nick ? `${summary.nick}님, ` : "";
  const topline = loading
    ? "분석 중…"
    : nick +
      (data?.needle_label ??
        (recs[0] ? `${recs[0].org} 방향을 가리켜요` : "결과"));

  return (
    <div className="animate-[pol-up_0.35s_ease] space-y-5">
      {/* 히어로 + 나침반 바늘 */}
      <div className="bg-primary flex items-center gap-5 rounded-[20px] p-6 text-white">
        <svg width="76" height="76" viewBox="0 0 100 100" className="shrink-0">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#576CBC"
            strokeWidth="2"
            opacity="0.5"
          />
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "50% 50%",
              transition: "transform 1.1s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <polygon points="50,12 56,50 50,46 44,50" fill="#8b7ce0" />
            <polygon points="50,88 56,50 50,54 44,50" fill="#F59E0B" />
          </g>
          <circle cx="50" cy="50" r="4" fill="#fff" />
        </svg>
        <div>
          <p className="mb-1 text-xs text-white/70">진단 완료!</p>
          <p className="text-lg font-bold">{topline}</p>
        </div>
      </div>

      {loading ? (
        <LoadingCard />
      ) : (
        <>
          {/* 입력 프로필 칩 */}
          {PROFILE_LABELS.some(([k]) => summary[k]) && (
            <div className="bg-card border-border rounded-[16px] border p-3">
              <p className="text-muted-foreground mb-1.5 text-[11px]">
                입력하신 프로필
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PROFILE_LABELS.filter(([k]) => summary[k]).map(
                  ([k, label]) => (
                    <span
                      key={k}
                      className="bg-secondary border-border text-muted-foreground rounded-full border px-2 py-0.5 text-[11px]"
                    >
                      {label}: {summary[k]}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              <span className="text-point">●</span> 당신에게 맞는 국제기구 Top 3
            </h3>
            {recs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                매칭 결과가 적어요. 다시 진단하거나 관심 분야를 더 선택해보세요.
              </p>
            ) : (
              <div className="space-y-3">
                {recs.map((r, i) => (
                  <OrgCard key={i} rec={r} />
                ))}
              </div>
            )}
          </div>

          {/* AI 조언 */}
          {data?.advice && (
            <div className="bg-accent border-point-border rounded-[16px] border p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-point">✦</span>
                <span className="text-foreground text-xs font-semibold">
                  AI 맞춤 조언
                </span>
                <span className="border-border text-muted-foreground ml-auto rounded-full border bg-white px-1.5 py-0.5 text-[10px]">
                  {isAI ? "AI 분석 (Gemini)" : "규칙기반 (오프라인 폴백)"}
                </span>
              </div>
              <p className="text-foreground text-sm leading-relaxed">
                {data.advice}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="border-border text-muted-foreground flex-1 rounded-xl border bg-white py-3 text-sm hover:bg-[var(--secondary)]"
            >
              다시 진단
            </button>
            <Button className="bg-primary h-auto flex-1 rounded-xl py-3 text-sm font-medium">
              이 기구 준비 로드맵 짜기 →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function OrgCard({ rec }: { rec: Recommendation }) {
  const pct = rec.score ?? 60;
  return (
    <div className="bg-card border-border rounded-[16px] border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-accent flex size-10 items-center justify-center rounded-xl text-lg">
            {iconFor(rec.field)}
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold">
              {rec.org || rec.abbr}
            </p>
            <p className="text-muted-foreground text-xs">{rec.field}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${scoreClass(pct)}`}
        >
          적합도 {pct}%
        </span>
      </div>
      {(rec.matched?.length || rec.missing?.length) > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(rec.matched ?? []).map((m, i) => (
            <span
              key={`m${i}`}
              className="bg-secondary border-border rounded-full border px-2 py-0.5 text-xs"
            >
              {m} ✓
            </span>
          ))}
          {(rec.missing ?? []).map((m, i) => (
            <span
              key={`x${i}`}
              className="rounded-full border border-[#FDE68A] bg-[#FEF9EC] px-2 py-0.5 text-xs text-[#92400E]"
            >
              보완: {m}
            </span>
          ))}
        </div>
      )}
      {rec.lang_tip && (
        <p className="text-muted-foreground mt-2 text-[11px]">
          🗣️ {rec.lang_tip}
        </p>
      )}
    </div>
  );
}

function LoadingCard() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setI((v) => (v + 1) % LOADING_MSGS.length),
      2200,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-card border-border rounded-[16px] border p-8 text-center">
      <div className="border-secondary border-t-point mx-auto mb-3 size-7 animate-[pol-spin_1s_linear_infinite] rounded-full border-2" />
      <p className="text-muted-foreground text-sm">{LOADING_MSGS[i]}</p>
      <p className="text-muted-foreground/70 mt-1 text-[11px]">
        AI가 36개 국제기구와 꼼꼼히 비교하느라 10초쯤 걸려요
      </p>
    </div>
  );
}
