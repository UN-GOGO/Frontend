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
 * 원칙(2026-06-28 회의 합의): A는 별도 문항을 갖지 않고 **B 문항의 부분집합**만 묻는다.
 *   - A(4문항): 호칭 · 학업단계+전공 · 영어 수준 · 제2외국어(언어+수준)
 *   - B(6문항): 위 + 졸업 시기 · 경험/경력 · 각종 자격증 · 석사 연구 주제
 *
 * 값은 모두 문자열로 둔다(대화형 입력 1턴 = 1문자열). 복수 선택 항목은
 * ", "로 이어 붙인 문자열로 저장하여 마이페이지 폼에서도 그대로 편집·표시된다.
 *
 * ※ target_field(관심 분야)·target_path(진출 경로)는 **프로필에서 직접 묻지 않는다**.
 *   진단 퀴즈와 중복이기 때문(2026-07-09 결정). 대신 buildProfile()이 퀴즈 답에서
 *   도출해 채운다. 공고·인사이트 추천이 이 두 값을 참조하므로 필드 자체는 유지하며,
 *   마이페이지에서 사용자가 직접 확인·수정할 수 있다.
 */
export type ProfileSummary = {
  track: CompassTrack | "";
  nickname: string; // 호칭 (공통, 선택)
  status: string; // 학업 단계 (공통, 필수)
  bachelor_major: string; // 학사 전공 (공통, 필수)
  graduate_major: string; // 석사 전공 (공통, 석사 이상일 때만)
  research_topic: string; // 연구 주제 (B 전용, 석사 이상일 때만, 선택)
  graduation_timing: string; // 졸업 또는 졸업예정 시기 (B 전용, 선택)
  experience_types: string; // 관련 경험 종류(복수, ", " 결합) (B 전용)
  experience_years: string; // 관련 경험 기간 (B 전용)
  experience_detail: string; // 경험 한 줄 보충 (B 전용, 선택)
  english_level: string; // 영어 업무 수행 수준 (공통, 필수)
  english_cert: string; // 영어 자격증 (B 전용, 선택)
  second_language: string; // 제2외국어 (공통, 선택)
  second_language_level: string; // 제2외국어 수준 (공통, 제2외국어 있을 때)
  second_language_cert: string; // 제2외국어 자격증 (B 전용, 제2외국어 있을 때)

  // 프로필에서 직접 묻지 않고 퀴즈 답에서 도출되는 값 (위 주석 참조)
  target_field: string; // 관심 분야
  target_path: string; // 관심 진출 경로

  // 하위 호환 보존 필드 (과거 저장 데이터 표시용, 새로 묻지 않음)
  familiarity: string;
  interest_hint: string;
  cert: string;
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
  score: number; // 백엔드 AI는 0~1, 오프라인 폴백은 0~100
  tags?: string[];
  reasons?: string[];
  creative?: string;
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
