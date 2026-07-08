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
  familiarity: "",
  interest_hint: "",
  bachelor_major: "",
  graduate_major: "",
  graduation_timing: "",
  experience_years: "",
  english_level: "",
  second_language: "",
  target_field: "",
  target_path: "",
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
  | { kind: "text"; placeholder?: string; optional?: boolean }
);

const INTEREST_PROFILE: ProfileStep[] = [
  {
    key: "nickname",
    kind: "text",
    ask: "닉네임을 알려주세요. (선택)",
    placeholder: "선택",
    optional: true,
  },
  {
    key: "status",
    kind: "single",
    ask: "지금은 어떤 상황에 가장 가까운가요?",
    opts: STATUS_OPTIONS,
  },
  {
    key: "familiarity",
    kind: "single",
    ask: "국제기구 친숙도는 어느 정도인가요?",
    opts: ["거의 모른다", "이름만 들어봤다", "몇 곳은 알고 있다"],
  },
  {
    key: "interest_hint",
    kind: "text",
    ask: "전공 또는 요즘 관심사가 있나요? 편하게 적어주세요.",
    placeholder: "예: 경제학, 환경, 국제뉴스, 아직 없음",
    optional: true,
  },
];

const ADVANCED_PROFILE: ProfileStep[] = [
  {
    key: "status",
    kind: "single",
    ask: "현재 상태를 알려주세요.",
    opts: STATUS_OPTIONS,
  },
  {
    key: "bachelor_major",
    kind: "text",
    ask: "학사 전공이 어떻게 되나요?",
    placeholder: "예: 환경공학",
  },
  {
    key: "graduate_major",
    kind: "text",
    ask: "석사 전공이 있다면 알려주세요.",
    placeholder: "해당 시",
    optional: true,
  },
  {
    key: "graduation_timing",
    kind: "text",
    ask: "졸업 또는 졸업예정 시기를 알려주세요.",
    placeholder: "예: 2026-02",
    optional: true,
  },
  {
    key: "experience_years",
    kind: "single",
    ask: "국제기구 관련 경력은 어느 정도인가요?",
    opts: EXPERIENCE_OPTIONS,
  },
  {
    key: "english_level",
    kind: "single",
    ask: "영어 업무 수행 수준은 어디에 가까운가요?",
    opts: ENGLISH_OPTIONS,
  },
  {
    key: "second_language",
    kind: "text",
    ask: "제2외국어가 있다면 알려주세요.",
    placeholder: "예: 프랑스어 B1, 없음",
    optional: true,
  },
  {
    key: "target_field",
    kind: "text",
    ask: "관심 분야가 있나요? 적어주세요.",
    placeholder: "예: 환경·기후, 개발협력, 인권",
    optional: true,
  },
  {
    key: "target_path",
    kind: "single",
    ask: "관심 있는 진출 경로가 있나요?",
    opts: PATH_OPTIONS,
  },
  {
    key: "cert",
    kind: "text",
    ask: "가지고 있는 자격증이 있다면 적어주세요.",
    placeholder: "예: 정보처리기사, 없음",
    optional: true,
  },
];

export function shouldSkipStep(
  key: string,
  profile: Partial<ProfileSummary>,
): boolean {
  if (key === "graduate_major") {
    return profile.status !== "석사 재학" && profile.status !== "석사 이상";
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
      { t: "다시 세워지는 무너진 학교", tags: ["f:교육"] },
      { t: "수출길이 막힌 작은 나라", tags: ["f:경제"] },
      { t: "평화 협정에 서명하는 손", tags: ["f:평화"] },
      { t: '"같은 일, 다른 임금" 팻말', tags: ["f:성평등"] },
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
  nickname: "닉네임",
  status: "현재 상태",
  familiarity: "국제기구 친숙도",
  interest_hint: "전공 또는 요즘 관심사",
  bachelor_major: "학사 전공",
  graduate_major: "석사 전공",
  graduation_timing: "졸업 또는 졸업예정 시기",
  experience_years: "관련 경력",
  english_level: "영어 업무 수행 수준",
  second_language: "제2외국어",
  target_field: "관심 분야",
  target_path: "관심 진출 경로",
  cert: "자격증",
};

// ===== 백엔드 전송용 프로필 텍스트 빌드 =====
export function buildProfile(
  profile: ProfileSummary,
  answers: Answer[],
  track: CompassTrack,
): BuiltProfile {
  const flow = FLOWS[track];

  const profileLines: string[] = [];
  if (profile.nickname) profileLines.push(`- 닉네임: ${profile.nickname}`);
  flow.profile.forEach((step) => {
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

  return { text, summary: profile };
}
