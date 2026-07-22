// 나침반(Compass) — A/B 대화형 흐름 정의
//
// 회의록(2026-06-28) 반영:
// - 첫 질문("준비해봤나요 / 관심만 있나요")으로 A/B 자동 분기 (토글 아님)
// - 프로필 입력 항목은 공통 스키마(B ⊇ A). 묻는 강도·문구만 차등
//   · A(interest): status, major, english
//   · B(advanced): + experience, second, cert, targetPath
// - 문항 은행은 A/B가 서로 다름 (un-gogo feat/compass-ab 자산 이식)
// - 백엔드 계약은 그대로: buildProfile()이 하나의 profile 문자열로 합쳐 전송

import type {
  Answer,
  BuiltProfile,
  CompassTrack,
  ProfileSummary,
} from "./types";

/** 저장/초기화용 빈 프로필 */
export const EMPTY_PROFILE: ProfileSummary = {
  track: "",
  nickname: "",
  status: "",
  bachelor_major: "",
  graduate_major: "",
  research_topic: "",
  graduation_timing: "",
  experience_types: "",
  experience_years: "",
  experience_detail: "",
  english_level: "",
  english_cert: "",
  second_language: "",
  second_language_level: "",
  second_language_cert: "",
  target_field: "",
  target_path: "",
  familiarity: "",
  interest_hint: "",
  cert: "",
};

// ===== 공통 선택지 (마이페이지 프로필 폼도 재사용) =====
export const STATUS_OPTIONS = [
  "학부 재학",
  "학사 졸업",
  "석사 재학",
  "석사 이상",
  "재직 중",
  "구직 중",
];
export const ENGLISH_OPTIONS = [
  "자료 읽기 가능",
  "이메일·문서 작성 가능",
  "회의 참여 가능",
  "발표·협상 가능",
];
export const EXPERIENCE_OPTIONS = [
  "없음",
  "1년 미만",
  "1~2년",
  "3~5년",
  "5년 이상",
];
/** 관련 경험 종류(복수 선택) */
export const EXPERIENCE_TYPE_OPTIONS = [
  "인턴",
  "공모전·대외활동",
  "연구",
  "NGO·봉사",
  "관련 직무",
  "없음",
];
/** 제2외국어 — UN 공용어 중심 */
export const LANGUAGE_OPTIONS = [
  "프랑스어",
  "스페인어",
  "러시아어",
  "중국어",
  "아랍어",
  "그 외 언어",
  "없음",
];
/** 제2외국어 수준 (영어 수준과 동일한 4단계) */
export const LANGUAGE_LEVEL_OPTIONS = ENGLISH_OPTIONS;
export const PATH_OPTIONS = [
  "아직 모르겠다",
  "인턴십",
  "JPO",
  "UNV",
  "YPP",
  "컨설턴트",
  "NGO·개발협력 경유",
];

// ===== 첫 질문: A/B 자동 분기 =====
export const BRANCH = {
  label: "시작",
  ask: "안녕하세요! 저는 여러분의 진로 나침반이에요. 먼저, 국제기구 진로를 준비해 본 적 있나요?",
  opts: [
    { t: "아직 관심만 있어요", track: "interest" as CompassTrack },
    { t: "한번 알아본 적 있어요", track: "advanced" as CompassTrack },
  ],
};

// ===== 프로필 스텝 (공통 스키마, 트랙별 강도·문구 차등) =====
export type ProfileStepKey = Exclude<keyof ProfileSummary, "track" | "nick">;

export type ProfileStep = {
  key: ProfileStepKey;
  ask: string;
  hint?: string;
} & (
  | { kind: "single"; opts: string[] }
  | { kind: "multi"; opts: string[]; max?: number; optional?: boolean }
  | { kind: "text"; placeholder?: string; optional?: boolean }
);

// 문항 마스터 — B가 전체, A는 여기서 일부만 골라 쓴다(중복 정의 금지).
const STEP = {
  nickname: {
    key: "nickname",
    kind: "text",
    ask: "제가 어떻게 불러드리면 좋을까요?",
    placeholder: "닉네임이나 이름을 편하게 적어주세요",
    optional: true,
  },
  status: {
    key: "status",
    kind: "single",
    ask: "지금 학업 단계가 어떻게 되시나요?",
    opts: STATUS_OPTIONS,
  },
  bachelor_major: {
    key: "bachelor_major",
    kind: "text",
    ask: "학부 전공이 어떻게 되세요?",
    placeholder: "예: 환경공학",
  },
  graduate_major: {
    key: "graduate_major",
    kind: "text",
    ask: "석사 전공도 알려주실 수 있을까요?",
    placeholder: "예: 국제협력학",
    optional: true,
  },
  research_topic: {
    key: "research_topic",
    kind: "text",
    ask: "혹시 참여하신 연구가 있다면, 주제를 간단히 들려주시겠어요?",
    placeholder: "예: 기후변화 적응 정책",
    optional: true,
  },
  graduation_timing: {
    key: "graduation_timing",
    kind: "text",
    ask: "졸업(또는 졸업 예정) 시기는 언제쯤이신가요?",
    placeholder: "예: 2027-02",
    optional: true,
  },
  experience_types: {
    key: "experience_types",
    kind: "multi",
    ask: "국제기구와 관련된 경험이 있으신가요? 해당하는 걸 모두 골라주세요.",
    opts: EXPERIENCE_TYPE_OPTIONS,
    optional: true,
  },
  experience_years: {
    key: "experience_years",
    kind: "single",
    ask: "그 경험은 어느 정도 기간이었나요?",
    opts: EXPERIENCE_OPTIONS,
  },
  experience_detail: {
    key: "experience_detail",
    kind: "text",
    ask: "어떤 활동이었는지 한 줄로 적어주셔도 좋아요.",
    placeholder: "예: 환경 NGO에서 캠페인 기획 6개월",
    optional: true,
  },
  english_level: {
    key: "english_level",
    kind: "single",
    ask: "영어로 업무하실 때, 어느 정도가 편하세요?",
    opts: ENGLISH_OPTIONS,
  },
  english_cert: {
    key: "english_cert",
    kind: "text",
    ask: "영어 자격증이 있으시면 적어주세요.",
    placeholder: "없으시면 '없음'이라고만 적어주셔도 괜찮아요",
    optional: true,
  },
  second_language: {
    key: "second_language",
    kind: "single",
    ask: "영어 외에 다른 외국어도 사용하시나요?",
    opts: LANGUAGE_OPTIONS,
  },
  second_language_level: {
    key: "second_language_level",
    kind: "single",
    ask: "그 언어는 어느 정도 수준이세요?",
    opts: LANGUAGE_LEVEL_OPTIONS,
  },
  second_language_cert: {
    key: "second_language_cert",
    kind: "text",
    ask: "해당 언어 자격증이 있으시면 적어주세요.",
    placeholder: "없으시면 '없음'이라고만 적어주셔도 괜찮아요",
    optional: true,
  },
} satisfies Record<string, ProfileStep>;

// A(흥미·입문) — B의 부분집합. 졸업 시기·경험/경력·연구 주제·자격증을 묻지 않는다.
const INTEREST_PROFILE: ProfileStep[] = [
  STEP.nickname,
  STEP.status,
  STEP.bachelor_major,
  STEP.graduate_major,
  STEP.english_level,
  STEP.second_language,
  STEP.second_language_level,
];

// B(고급·정보취득) — 전체 문항
const ADVANCED_PROFILE: ProfileStep[] = [
  STEP.nickname,
  STEP.status,
  STEP.bachelor_major,
  STEP.graduate_major,
  STEP.research_topic,
  STEP.graduation_timing,
  STEP.experience_types,
  STEP.experience_years,
  STEP.experience_detail,
  STEP.english_level,
  STEP.english_cert,
  STEP.second_language,
  STEP.second_language_level,
  STEP.second_language_cert,
];

/** 석사 과정 이상인지 — 석사 전공·연구 주제 문항의 노출 조건 */
const isGraduate = (status?: string) =>
  status === "석사 재학" || status === "석사 이상";

/** 제2외국어를 실제로 쓰는지 — 수준·자격증 후속 문항의 노출 조건 */
const usesSecondLanguage = (v?: string) => !!v && v !== "없음";

export function shouldSkipStep(
  key: string,
  profile: Partial<ProfileSummary>,
): boolean {
  // 석사 이상일 때만 석사 전공·연구 주제를 묻는다
  if (key === "graduate_major" || key === "research_topic") {
    return !isGraduate(profile.status);
  }
  // 경험이 "없음"뿐이면 기간·보충 설명은 묻지 않는다
  if (key === "experience_years" || key === "experience_detail") {
    const types = profile.experience_types ?? "";
    return !types || types === "없음";
  }
  // 제2외국어를 쓰지 않으면 수준·자격증은 묻지 않는다
  if (key === "second_language_level" || key === "second_language_cert") {
    return !usesSecondLanguage(profile.second_language);
  }
  return false;
}

// ===== 진단 문항 은행 (A/B 서로 다름) =====
export type ChipOption = { t: string; tags?: string[] };

export type QuizStep = { label: string; ask: string; hint?: string } & (
  | { kind: "single"; opts: ChipOption[] }
  | { kind: "multi"; max: number; opts: ChipOption[] }
  | { kind: "text"; placeholder?: string; optional?: boolean }
);

const INTEREST_QUIZ: QuizStep[] = [
  {
    kind: "multi",
    max: 2,
    label: "눈이 가는 장면",
    ask: "뉴스를 넘기다 나도 모르게 멈추는 장면은? (최대 2개)",
    opts: [
      { t: "녹아내리는 빙하와 사라지는 숲", tags: ["f:환경"] },
      { t: "물 길으러 몇 시간 걷는 아이", tags: ["f:개발"] },
      { t: "국경에 멈춰 선 난민 가족", tags: ["f:인권"] },
      { t: "백신을 기다리는 긴 줄", tags: ["f:보건"] },
      { t: "처음 글자를 배워보는 어르신", tags: ["f:교육"] },
      { t: "일자리를 잃고 문을 닫은 가게들", tags: ["f:경제"] },
      { t: "폭격에 무너진 도시", tags: ["f:평화"] },
      { t: "학교 대신 일터로 가는 아이", tags: ["f:노동"] },
      { t: "전기도 인터넷도 없는 교실", tags: ["f:기술"] },
    ],
  },
  {
    kind: "single",
    label: "첫 배정지",
    ask: "국제기구 세계에 입장! 첫 배정지를 고른다면?",
    opts: [{ t: "문제의 현장 한복판 🏕️" }, { t: "세계가 모이는 회의장 🏛️" }],
  },
  {
    kind: "single",
    label: "세상을 바꾸는 순간",
    ask: "'세상을 바꾼다'는 말이 제일 실감 나는 순간은?",
    opts: [
      { t: "한 사람의 삶이 나아질 때" },
      { t: "법과 제도가 바뀔 때" },
      { t: "새로운 지식이 쌓일 때" },
      { t: "나라들이 손을 잡을 때" },
    ],
  },
  {
    kind: "single",
    label: "팀에서의 나",
    ask: "조별과제에서 당신은?",
    opts: [
      { t: "조용히 자료 파고들어 정리하는 쪽 📚" },
      { t: "사람들 사이를 오가며 조율하는 쪽 🤝" },
    ],
  },
  {
    kind: "single",
    label: "나의 사명",
    ask: "둘 중 더 끌리는 사명은?",
    opts: [
      { t: "지금 당장 필요한 도움을 준다" },
      { t: "앞으로 생길 문제를 미리 막는다" },
    ],
  },
  {
    kind: "multi",
    max: 2,
    label: "신날 것 같은 일",
    ask: "국제기구에서 해보면 은근 신날 것 같은 일은? (최대 2개)",
    opts: [
      { t: "캠페인·콘텐츠 만들기 📣" },
      { t: "데이터 파헤치기 📊" },
      { t: "현장 프로젝트 뛰기 🏃" },
      { t: "통·번역, 소통하기 🗣️" },
      { t: "정책 아이디어 내기 💡" },
      { t: "국제행사 꾸리기 🎪" },
    ],
  },
  {
    kind: "single",
    label: "솔직 토크",
    ask: "솔직히, 국제기구에 끌리는 진짜 이유는? 🤔",
    opts: [
      { t: "세상에 진짜 보탬이 되고 싶어서 🌱" },
      { t: "넓은 무대에서 일해보고 싶어서 🌍" },
      { t: "내 전문성을 제대로 살리고 싶어서 💪" },
      { t: "그냥… 왠지 멋있어서 (ㅎㅎ) ✨" },
    ],
  },
];

const ADVANCED_QUIZ: QuizStep[] = [
  {
    kind: "multi",
    max: 2,
    label: "관심 이슈",
    ask: "요즘 마음이 가는 국제 이슈는? (최대 2개)",
    opts: [
      { t: "기후·환경", tags: ["f:환경"] },
      { t: "개발협력·빈곤", tags: ["f:개발"] },
      { t: "인권·난민·이주", tags: ["f:인권"] },
      { t: "보건", tags: ["f:보건"] },
      { t: "교육·문화", tags: ["f:교육"] },
      { t: "무역·경제", tags: ["f:경제"] },
      { t: "노동", tags: ["f:노동"] },
      { t: "평화·안보", tags: ["f:평화"] },
      { t: "식량·농업", tags: ["f:개발"] },
      { t: "디지털·기술", tags: ["f:기술"] },
    ],
  },
  {
    kind: "single",
    label: "상상 속 근무 무대",
    ask: "상상해보면, 일하고 싶은 무대는?",
    opts: [
      { t: "유럽의 국제도시 (제네바·빈 등) 🏛️" },
      { t: "뉴욕 UN 본부 🗽" },
      { t: "아시아·태평양 지역 🌏" },
      { t: "개발 현장 (아프리카·중남미 등) 🌍" },
      { t: "어디든 세계를 누비면 OK ✈️" },
    ],
  },
  {
    kind: "single",
    label: "조직 취향",
    ask: "왠지 더 끌리는 조직 스타일은?",
    opts: [
      { t: "UNDP·UNICEF처럼 넓게 다루는 대형 종합기구" },
      { t: "ILO·WIPO·IMO처럼 한 분야에 딥한 전문기구" },
    ],
  },
  {
    kind: "single",
    label: "커리어를 한 장면으로",
    ask: "당신의 커리어를 한 장면으로 그린다면?",
    opts: [
      { t: "문제의 현장에서 직접 뛰는 나 🏕️" },
      { t: "제도·규범을 설계하는 회의장의 나 🏛️" },
    ],
  },
  {
    kind: "multi",
    max: 2,
    label: "진입 경로",
    ask: "국제기구 진입, 어떤 경로가 끌려요? (최대 2개)",
    opts: [
      { t: "인턴십" },
      { t: "JPO" },
      { t: "YPP" },
      { t: "UNV" },
      { t: "컨설턴트" },
      { t: "NGO·개발협력 경유" },
      { t: "아직 탐색 중" },
    ],
  },
  {
    kind: "single",
    label: "프로젝트 첫 무브",
    ask: "새 프로젝트 배정 첫 주, 당신의 첫 무브는?",
    opts: [
      { t: "자료·선행연구부터 파고든다 📚" },
      { t: "데이터 모아 현황 진단 📊" },
      { t: "이해관계자부터 만나 조율 🤝" },
      { t: "실행계획·일정 세팅 🗂️" },
      { t: "메시지·보고라인 정리 📣" },
      { t: "관련 규범·정책 검토 ⚖️" },
    ],
  },
  {
    kind: "single",
    label: "이루고 싶은 것",
    ask: "국제기구에서 일한다면, 가장 이루고 싶은 건?",
    opts: [
      { t: "현장에서 사람들의 삶을 직접 바꾸기" },
      { t: "정책·제도로 근본 원인 해결하기" },
      { t: "전문 분야에서 최고 전문가 되기" },
      { t: "국가·기관 사이를 잇는 가교 되기" },
    ],
  },
  {
    kind: "text",
    label: "목표와 고민",
    ask: "마음에 둔 기구·직무·분야 등을 자유롭게 적어주세요. (선택)",
    placeholder: "예) UNEP 환경정책 인턴에 관심 있어요.",
    optional: true,
  },
];

// ===== 트랙 메타 =====
export type CompassFlow = {
  track: CompassTrack;
  title: string; // 결과·저장 표기용
  profile: ProfileStep[];
  quiz: QuizStep[];
};

export const FLOWS: Record<CompassTrack, CompassFlow> = {
  interest: {
    track: "interest",
    title: "흥미·입문(A)",
    profile: INTEREST_PROFILE,
    quiz: INTEREST_QUIZ,
  },
  advanced: {
    track: "advanced",
    title: "고급·정보취득(B)",
    profile: ADVANCED_PROFILE,
    quiz: ADVANCED_QUIZ,
  },
};

export function flowFor(track: CompassTrack): CompassFlow {
  return FLOWS[track];
}

// ===== 프로필 라벨 (결과 칩·프로필 텍스트 공용) =====
export const PROFILE_LABELS: Record<ProfileStepKey, string> = {
  nickname: "호칭",
  status: "학업 단계",
  bachelor_major: "학부 전공",
  graduate_major: "석사 전공",
  research_topic: "연구 주제",
  graduation_timing: "졸업(예정) 시기",
  experience_types: "관련 경험 종류",
  experience_years: "관련 경험 기간",
  experience_detail: "경험 설명",
  english_level: "영어 업무 수행 수준",
  english_cert: "영어 자격증",
  second_language: "제2외국어",
  second_language_level: "제2외국어 수준",
  second_language_cert: "제2외국어 자격증",
  target_field: "관심 분야",
  target_path: "관심 진출 경로",
  // 하위 호환 보존 필드(새로 묻지 않음)
  familiarity: "국제기구 친숙도",
  interest_hint: "전공 또는 요즘 관심사",
  cert: "자격증",
};

// ===== 퀴즈 답변 → 프로필 파생 =====
// 설계(2026-07-21): 관심 분야·진출 경로는 프로필에서 "묻지" 않고 퀴즈 답에서 "도출"한다.
//   - 이유: 프로필과 퀴즈가 같은 것을 두 번 묻는 중복을 없애되(2026-07-09 결정),
//     공고·인사이트 추천이 참조하는 target_field / target_path는 채워져야 한다.
//   - 사용자는 한 번만 답하고, 그 값이 프로필 정본(navigator_results.profile_input)에 남는다.
//   - 마이페이지에서 직접 수정하는 것도 그대로 가능하다(그 경우 사용자 입력을 우선).
// ※ profile_input은 jsonb이므로 이 파생값 반영에 DB 마이그레이션이 필요하지 않다.

/** 진출 경로를 묻는 퀴즈 문항의 label (현재 B 트랙 전용) */
const PATH_QUESTION_LABEL = "진입 경로";

/** 선택된 보기의 `f:분야` 태그를 모아 관심 분야 목록으로 만든다(중복 제거, 선택 순서 유지). */
function deriveTargetField(flow: CompassFlow, answers: Answer[]): string {
  const found: string[] = [];
  answers.forEach((a, qi) => {
    const Q = flow.quiz[qi];
    if (!Q || Q.kind === "text" || a == null) return;
    const idxs =
      Q.kind === "multi" ? (Array.isArray(a) ? a : []) : [a as number];
    idxs.forEach((i) => {
      Q.opts[i]?.tags?.forEach((tag) => {
        if (!tag.startsWith("f:")) return;
        const field = tag.slice(2);
        if (!found.includes(field)) found.push(field);
      });
    });
  });
  return found.join(", ");
}

/** "진입 경로" 문항에서 고른 보기들을 진출 경로로 만든다. A 트랙엔 해당 문항이 없어 "" 반환. */
function deriveTargetPath(flow: CompassFlow, answers: Answer[]): string {
  const qi = flow.quiz.findIndex((Q) => Q.label === PATH_QUESTION_LABEL);
  if (qi < 0) return "";
  const Q = flow.quiz[qi];
  const a = answers[qi];
  if (!Q || Q.kind === "text" || a == null) return "";
  const idxs = Q.kind === "multi" ? (Array.isArray(a) ? a : []) : [a as number];
  return idxs
    .map((i) => Q.opts[i]?.t)
    .filter(Boolean)
    .join(", ");
}

// ===== 백엔드 전송용 프로필 텍스트 빌드 =====
export function buildProfile(
  profile: ProfileSummary,
  answers: Answer[],
  track: CompassTrack,
): BuiltProfile {
  const flow = FLOWS[track];

  const profileLines: string[] = [];
  flow.profile.forEach((step) => {
    if (shouldSkipStep(step.key, profile)) return;
    const v = profile[step.key];
    if (v && v.trim()) {
      profileLines.push(`- ${PROFILE_LABELS[step.key]}: ${v.trim()}`);
    }
  });

  const answerLines: string[] = [];
  answers.forEach((a, qi) => {
    const Q = flow.quiz[qi];
    if (!Q || a == null || a === "") return;
    if (Q.kind === "text") {
      answerLines.push(`- ${Q.label}: ${a as string}`);
    } else if (Q.kind === "multi") {
      const idxs = Array.isArray(a) ? a : [];
      if (idxs.length)
        answerLines.push(
          `- ${Q.label}: ${idxs.map((i) => Q.opts[i].t).join(", ")}`,
        );
    } else {
      answerLines.push(`- ${Q.label}: ${Q.opts[a as number].t}`);
    }
  });

  const text = [
    `나침반 버전: ${flow.title}`,
    profileLines.length ? "[프로필]\n" + profileLines.join("\n") : "",
    answerLines.length ? "[진단 답변]\n" + answerLines.join("\n") : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // 퀴즈에서 도출한 관심 분야·진출 경로를 프로필에 실어 보낸다.
  // 사용자가 마이페이지에서 직접 적어둔 값이 있으면 그쪽을 존중한다(덮어쓰지 않음).
  const summary: ProfileSummary = {
    ...profile,
    target_field: profile.target_field || deriveTargetField(flow, answers),
    target_path: profile.target_path || deriveTargetPath(flow, answers),
  };

  return { text, summary };
}
