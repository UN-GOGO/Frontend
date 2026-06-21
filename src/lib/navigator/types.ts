// 나침반(Compass) — 국제기구 추천 기능 타입
// 백엔드 /recommend 응답 계약과 1:1로 맞춘다.

/** 인트로에서 받는 기본 프로필(모두 선택 입력) */
export type ProfileSummary = {
  nick: string;
  major: string;
  degree: string;
  exp: string;
  english: string;
  second: string;
};

/** 퀴즈 문항 정의 */
export type Question =
  | {
      type: "single";
      label: string;
      q: string;
      opts: { t: string; tags?: string[] }[];
    }
  | {
      type: "multi";
      max: number;
      label: string;
      q: string;
      opts: { t: string; tags?: string[] }[];
    }
  | {
      type: "text";
      label: string;
      q: string;
      placeholder?: string;
    };

/** 단일=선택 인덱스, 복수=인덱스 배열, 자유서술=문자열 */
export type Answer = number | number[] | string | null;

/** buildProfile 결과 — 백엔드에 보낼 자연어 텍스트 + 화면 표시용 요약 */
export type BuiltProfile = {
  text: string;
  summary: ProfileSummary;
};

/** 추천 결과 한 건 */
export type Recommendation = {
  abbr: string;
  org: string;
  field: string;
  score: number;
  matched: string[];
  missing: string[];
  lang_tip?: string;
};

/** POST /recommend 응답 */
export type RecommendResponse = {
  profile_summary?: string;
  needle_label?: string;
  recommendations: Recommendation[];
  advice?: string;
};
