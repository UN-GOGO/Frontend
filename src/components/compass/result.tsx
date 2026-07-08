"use client";

import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { saveNodeAsImage } from "@/lib/compass/capture";
import { sendCompassFeedback } from "@/lib/compass/feedback";
import type {
  ProfileSummary,
  Recommendation,
  RecommendResponse,
} from "@/lib/compass/types";

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
  if (pct >= 70) return "bg-point-soft text-point-hover";
  return "bg-secondary text-muted-foreground";
}

function scorePercent(score?: number) {
  const value = score ?? 0.6;
  return Math.round(value <= 1 ? value * 100 : value);
}

const LOADING_MSGS = [
  "프로필 분석 중…",
  "36개 국제기구와 비교 중…",
  "관심 분야·강점 매칭 중…",
  "맞춤 조언 작성 중…",
];

const PROFILE_LABELS: [keyof ProfileSummary, string][] = [
  ["status", "현재 상태"],
  ["major", "전공/관심"],
  ["experience", "경력"],
  ["english", "영어"],
  ["second", "제2외국어"],
  ["cert", "자격증"],
  ["targetPath", "진출 경로"],
];

export function Result({
  summary,
  data,
  isAI,
  timedOut,
  loading,
  onRetry,
}: {
  summary: ProfileSummary;
  data: RecommendResponse | null;
  isAI: boolean;
  /** isAI=false인 이유가 응답 지연(타임아웃)인지 — 오프라인 폴백과 다르게 안내 */
  timedOut?: boolean;
  loading: boolean;
  onRetry: () => void;
}) {
  const recs = (data?.recommendations ?? []).slice(0, 3);
  const topScore = scorePercent(recs[0]?.score);
  const angle = loading ? 20 : Math.round((topScore / 100) * 60 - 10);
  const nick = summary.nick ? `${summary.nick}님, ` : "";
  const topline = loading
    ? "분석 중…"
    : nick +
      (data?.needle_label ??
        (recs[0] ? `${recs[0].org} 방향을 가리켜요` : "결과"));

  // 결과 이미지 저장(캡쳐) — captureRef 영역만 PNG로 내보낸다(액션·피드백 제외)
  const captureRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    if (!captureRef.current || capturing) return;
    setCapturing(true);
    try {
      await saveNodeAsImage(
        captureRef.current,
        `나침반_결과${summary.nick ? `_${summary.nick}` : ""}.png`,
        "#f4f7fb",
      );
    } catch (e) {
      console.error("결과 이미지 저장 실패:", e);
      alert("이미지 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="animate-[pol-up_0.35s_ease] space-y-5">
      {loading ? (
        <CompassLoading />
      ) : (
        <>
          <div ref={captureRef} className="bg-background space-y-5">
            {/* 히어로 + 나침반 바늘 */}
            <div className="bg-primary relative flex items-center gap-5 overflow-hidden rounded-[20px] px-7 py-6 text-white">
              <span
                className="pointer-events-none absolute -top-12 -right-10 size-44 rounded-full blur-[12px]"
                style={{ background: "rgba(104,190,253,0.25)" }}
              />
              <svg
                width="84"
                height="84"
                viewBox="0 0 100 100"
                className="relative shrink-0"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#68BEFD"
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
                  <polygon points="50,12 56,50 50,46 44,50" fill="#68BEFD" />
                  <polygon points="50,88 56,50 50,54 44,50" fill="#F59E0B" />
                </g>
                <circle cx="50" cy="50" r="4" fill="#fff" />
              </svg>
              <div className="relative min-w-0">
                <p className="mb-1 text-xs font-semibold text-white/60">
                  진단 완료
                </p>
                <p className="text-xl leading-snug font-extrabold tracking-tight text-balance">
                  {topline}
                </p>
              </div>
            </div>

            {/* 입력 프로필 칩 */}
            {PROFILE_LABELS.some(([k]) => summary[k]) && (
              <div className="border-border bg-card rounded-[16px] border p-4">
                <p className="text-muted-foreground mb-2 text-[11px] font-bold">
                  입력하신 프로필
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PROFILE_LABELS.filter(([k]) => summary[k]).map(
                    ([k, label]) => (
                      <span
                        key={k}
                        className="border-border text-muted-foreground rounded-full border bg-white px-2.5 py-1 text-[11px]"
                      >
                        <span className="text-foreground/50">{label}</span>{" "}
                        {summary[k]}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-extrabold">
                <span className="bg-point size-2 rounded-full" />
                당신에게 맞는 국제기구 Top 3
              </h3>
              {recs.length === 0 ? (
                <div className="border-border text-muted-foreground rounded-[16px] border border-dashed p-6 text-center text-sm">
                  매칭 결과가 적어요. 다시 진단하거나 관심 분야를 더
                  선택해보세요.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {recs.map((r, i) => (
                    <OrgCard key={i} rec={r} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {/* 더 둘러볼 기구 */}
            {data?.explore && data.explore.length > 0 && (
              <div>
                <h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-extrabold">
                  <span className="bg-point/40 size-2 rounded-full" />이
                  분야라면 함께 둘러보세요
                </h3>
                <div className="flex flex-col gap-2.5">
                  {data.explore.map((g, i) => (
                    <div
                      key={i}
                      className="border-border bg-card rounded-[14px] border p-4"
                    >
                      <p className="text-foreground text-[13px] font-bold">
                        {g.topic}
                      </p>
                      {g.orgs.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {g.orgs.map((o, j) => (
                            <span
                              key={j}
                              className="bg-point-soft text-point-hover rounded-full px-2.5 py-1 text-[11px] font-semibold"
                            >
                              {o}
                            </span>
                          ))}
                        </div>
                      )}
                      {g.note && (
                        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                          {g.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI 조언 */}
            {data?.advice && (
              <div className="border-point-border bg-point-soft rounded-[16px] border p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-point">✦</span>
                  <span className="text-foreground text-xs font-extrabold">
                    AI 맞춤 조언
                  </span>
                  <span className="border-border text-muted-foreground ml-auto rounded-full border bg-white px-2 py-0.5 text-[10px] font-semibold">
                    {isAI
                      ? `AI 분석 (${data.engine ?? "AI"})`
                      : timedOut
                        ? "AI 응답 지연 — 규칙기반으로 표시"
                        : "규칙기반 (오프라인 폴백)"}
                  </span>
                </div>
                {!isAI && timedOut && (
                  <p className="text-muted-foreground mb-2 text-xs">
                    AI 분석이 평소보다 오래 걸려 규칙 기반 추천을 먼저
                    보여드려요. 잠시 후 “다시 진단”으로 다시 시도해보세요.
                  </p>
                )}
                <p className="text-foreground text-sm leading-relaxed">
                  {data.advice}
                </p>
              </div>
            )}
          </div>
          {/* ↑ 여기까지가 캡쳐 대상(captureRef). 아래 액션·피드백은 이미지에 포함 안 됨 */}

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleCapture}
              disabled={capturing}
              className="border-border text-foreground hover:border-point-border flex flex-1 items-center justify-center gap-1.5 rounded-xl border bg-white py-3 text-sm font-bold transition-colors disabled:opacity-60"
            >
              <Camera className="size-4" />
              {capturing ? "저장 중…" : "이미지로 저장"}
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="border-border text-muted-foreground hover:border-point-border flex-1 rounded-xl border bg-white py-3 text-sm font-bold transition-colors"
            >
              다시 진단
            </button>
          </div>

          <Button className="bg-primary hover:bg-point-hover h-auto w-full rounded-xl py-3 text-sm font-bold">
            이 기구 준비 로드맵 짜기 →
          </Button>

          <Feedback />
        </>
      )}
    </div>
  );
}

const FEEDBACK_EMOJIS = ["😍", "🙂", "😐", "🙁"];

function Feedback() {
  const [picked, setPicked] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="border-border text-muted-foreground rounded-[14px] border border-dashed p-4 text-center text-xs">
        소중한 의견 고마워요! 🙏
      </div>
    );
  }

  const submit = async (emoji: string, withText: boolean) => {
    setPicked(emoji);
    if (!withText) return; // 이모지만 선택 — 전송은 버튼/입력 후
    await sendCompassFeedback(emoji, text);
    setSent(true);
  };

  return (
    <div className="border-border bg-card rounded-[14px] border p-4">
      <p className="text-foreground text-xs font-bold">
        이 추천 결과가 도움이 되었나요?
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        {FEEDBACK_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => submit(e, false)}
            className={`flex size-9 items-center justify-center rounded-full border text-lg transition-colors ${
              picked === e
                ? "border-point-border bg-point-soft"
                : "border-border hover:border-point-border bg-white"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      {picked && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={text}
            onChange={(ev) => setText(ev.target.value)}
            placeholder="한 줄 의견 (선택)"
            className="border-border text-foreground placeholder:text-muted-foreground focus:border-point flex-1 rounded-[10px] border px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => submit(picked, true)}
            className="bg-primary hover:bg-point-hover rounded-[10px] px-4 py-2 text-[13px] font-bold text-white transition-colors"
          >
            보내기
          </button>
        </div>
      )}
    </div>
  );
}

function OrgCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const pct = scorePercent(rec.score);
  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-[16px] border p-4">
      <div className="flex items-start gap-3">
        <div className="bg-point-soft relative flex size-11 shrink-0 items-center justify-center rounded-xl text-lg">
          {iconFor(rec.field)}
          <span className="bg-primary absolute -top-1.5 -left-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white">
            {rank}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-extrabold">
            {rec.org || rec.abbr}
          </p>
          <p className="text-muted-foreground truncate text-xs">{rec.field}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${scoreClass(pct)}`}
        >
          적합도 {pct}%
        </span>
        {rec.postings && (
          <span
            title={rec.postings.sample}
            className="w-fit rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-1 text-[11px] font-bold text-[#15803d]"
          >
            🟢 공석 {rec.postings.count}건
          </span>
        )}
      </div>
      {rec.postings && (
        <p className="text-muted-foreground -mt-1 truncate text-[11px]">
          {rec.postings.types}
        </p>
      )}

      {(rec.matched?.length || rec.missing?.length) > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(rec.matched ?? []).map((m, i) => (
            <span
              key={`m${i}`}
              className="bg-secondary border-border text-foreground/80 rounded-full border px-2 py-0.5 text-[11px]"
            >
              {m} ✓
            </span>
          ))}
          {(rec.missing ?? []).map((m, i) => (
            <span
              key={`x${i}`}
              className="rounded-full border border-[#FDE68A] bg-[#FEF9EC] px-2 py-0.5 text-[11px] text-[#92400E]"
            >
              보완: {m}
            </span>
          ))}
        </div>
      )}
      {rec.lang_tip && (
        <p className="text-muted-foreground mt-auto text-[11px]">
          🗣️ {rec.lang_tip}
        </p>
      )}
    </div>
  );
}

function CompassLoading() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setI((v) => (v + 1) % LOADING_MSGS.length),
      2000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="border-border bg-card flex flex-col items-center rounded-[20px] border px-6 py-12 text-center">
      <svg
        width="168"
        height="168"
        viewBox="0 0 200 200"
        className="mb-6"
        aria-hidden
      >
        {/* 바깥 링 */}
        <circle
          cx="100"
          cy="100"
          r="84"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle
          cx="100"
          cy="100"
          r="66"
          fill="var(--point-soft)"
          opacity="0.25"
        />

        {/* N/E/S/W 눈금 */}
        {[
          [100, 18, 100, 30],
          [182, 100, 170, 100],
          [100, 182, 100, 170],
          [18, 100, 30, 100],
        ].map(([x1, y1, x2, y2], k) => (
          <line
            key={k}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--muted-foreground)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        ))}

        {/* 회전하는 진행 아크 */}
        <g
          className="animate-[pol-spin_1.8s_linear_infinite]"
          style={{ transformOrigin: "50% 50%" }}
        >
          <circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="var(--point)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="78 450"
          />
        </g>

        {/* 바늘 (N 고정) */}
        <g>
          <polygon points="100,40 110,100 100,94 90,100" fill="var(--point)" />
          <polygon points="100,160 110,100 100,106 90,100" fill="#F59E0B" />
        </g>
        <circle
          cx="100"
          cy="100"
          r="6"
          fill="var(--card)"
          stroke="var(--point)"
          strokeWidth="2"
        />

        {/* 방위 라벨 */}
        {(
          [
            ["N", 100, 13, "var(--point-hover)"],
            ["E", 192, 105, "var(--muted-foreground)"],
            ["S", 100, 197, "var(--muted-foreground)"],
            ["W", 8, 105, "var(--muted-foreground)"],
          ] as const
        ).map(([t, x, y, fill]) => (
          <text
            key={t}
            x={x}
            y={y}
            fill={fill}
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {t}
          </text>
        ))}
      </svg>

      <p className="text-foreground text-base font-extrabold">분석 중이에요</p>
      <p className="text-point-hover mt-2 text-sm font-bold">
        {LOADING_MSGS[i]}
      </p>
      <p className="text-muted-foreground/70 mt-2 text-xs leading-relaxed">
        AI가 36개 국제기구와 꼼꼼히 비교하느라
        <br />
        10초쯤 걸려요
      </p>
    </div>
  );
}
