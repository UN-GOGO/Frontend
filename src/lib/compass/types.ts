// 나침반(Compass) — 국제기구 추천 기능 타입
// 백엔드 /compass/recommend 응답 계약과 1:1로 맞춘다.

/**
 * 나침반 트랙(A/B). 첫 질문("준비해봤나요 / 관심만 있나요")으로 자동 분기된다.
 * - interest = A(흥미·입문) : 가볍게 묻고 문구도 부드럽게
 * - advanced = B(고급·정보취득) : 전공·경력·언어까지 정교하게
 */
export type CompassTrack = "interest" | "advanced";

/**
 * 나침반 프로필 — A/B 공통 스키마(B ⊇ A).
 * A는 {track, nick, status, major, english}만 채우고,
 * B는 거기에 {experience, second, cert, targetPath}를 추가로 채운다.
 * 저장/표시가 단순하도록 항목 키는 하나로 통일한다.
 */
export type ProfileSummary = {
  track: CompassTrack | "";
  nick: string;
  status: string; // 현재 상태 (공통)
  major: string; // A: 요즘 관심 주제 · B: 학사 전공 (공통 키)
  english: string; // 영어 업무 수행 수준 (공통, 객관식)
  experience: string; // 관련 경력 (B 전용)
  second: string; // 제2외국어 (B 전용)
  cert: string; // 자격증 (B 전용)
  targetPath: string; // 관심 진출 경로 (B 전용)
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

/** 현재 공석 배지 (백엔드가 외교부 공석 API와 매칭해 채워줌) */
export type PostingBadge = {
  count: number;
  types: string; // 예: "인턴십 2 · JPO 1"
  sample: string; // 대표 공석 제목
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
  postings?: PostingBadge;
};

/** 추가로 둘러볼 기구 묶음 */
export type ExploreGroup = {
  topic: string;
  orgs: string[];
  note?: string;
};

/** POST /compass/recommend 응답 */
export type RecommendResponse = {
  profile_summary?: string;
  needle_label?: string;
  recommendations: Recommendation[];
  explore?: ExploreGroup[];
  advice?: string;
  engine?: string; // 예: "gpt-4o-mini"
};
