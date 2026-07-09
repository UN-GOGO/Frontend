import { flowFor } from "./flows";
import type { Answer, CompassTrack, RecommendResponse } from "./types";

// ===== 규칙 기반 폴백 (백엔드 미동작 시) — 최소 카탈로그로 자체 채점 =====
// 백엔드(un-gogo)가 켜지면 전체 국제기구 카탈로그 실데이터 기반 AI 추천으로 대체된다.
const FALLBACK_ORGS = [
  {
    abbr: "UNDP",
    ko: "유엔개발계획",
    field: "개발·빈곤퇴치 · 뉴욕",
    fields: ["개발"],
  },
  {
    abbr: "WHO",
    ko: "세계보건기구",
    field: "보건·의료 · 제네바",
    fields: ["보건"],
  },
  {
    abbr: "UNESCO",
    ko: "유네스코",
    field: "교육·문화·과학 · 파리",
    fields: ["교육"],
  },
  {
    abbr: "ILO",
    ko: "국제노동기구",
    field: "노동·고용 · 제네바",
    fields: ["노동"],
  },
  {
    abbr: "WTO",
    ko: "세계무역기구",
    field: "무역·통상 · 제네바",
    fields: ["경제"],
  },
  {
    abbr: "FAO",
    ko: "식량농업기구",
    field: "농업·식량 · 로마",
    fields: ["환경", "개발"],
  },
  {
    abbr: "IOM",
    ko: "국제이주기구",
    field: "이주·인도주의 · 제네바",
    fields: ["인권"],
  },
  {
    abbr: "IAEA",
    ko: "국제원자력기구",
    field: "원자력·과학 · 빈",
    fields: ["평화"],
  },
];

export function ruleBased(
  answers: Answer[],
  track: CompassTrack,
): RecommendResponse {
  const quiz = flowFor(track).quiz;
  const tags: string[] = [];
  answers.forEach((a, qi) => {
    const Q = quiz[qi];
    if (!Q || a == null) return;
    if (Q.kind === "multi") {
      (Array.isArray(a) ? a : []).forEach((i) =>
        (Q.opts[i].tags ?? []).forEach((t) => tags.push(t)),
      );
    } else if (Q.kind === "single") {
      (Q.opts[a as number].tags ?? []).forEach((t) => tags.push(t));
    }
  });

  const has = (t: string) => tags.includes(t);
  const scored = FALLBACK_ORGS.map((o) => {
    let s = 50;
    const matched: string[] = [];
    o.fields.forEach((f) => {
      if (has("f:" + f)) {
        s += 18;
        matched.push(f);
      }
    });
    return {
      abbr: o.abbr,
      org: `${o.abbr} · ${o.ko}`,
      field: o.field,
      score: Math.min(95, s),
      matched: matched.length ? matched : ["관심 분야 근접"],
      missing: [] as string[],
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    needle_label: `${scored[0].org} 방향을 가리켜요`,
    recommendations: scored,
    advice:
      "지금은 AI 대신 간단한 방식으로 찾아드렸어요. 곧 AI가 더 꼼꼼히 찾아드릴 수 있게 될 거예요.",
  };
}
