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
  nick: "",
  status: "",
  major: "",
  english: "",
  experience: "",
  second: "",
  cert: "",
  targetPath: "",
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
    key: "status",
    kind: "single",
    ask: "지금은 어떤 상황에 가장 가까운가요?",
    opts: STATUS_OPTIONS,
  },
  {
    key: "major",
    kind: "text",
    ask: "요즘 관심 있는 주제나 전공이 있나요? 편하게 적어주세요. (없어도 괜찮아요)",
    placeholder: "예: 환경, 국제뉴스, 아직 없음",
    optional: true,
  },
  {
    key: "english",
    kind: "single",
    ask: "영어는 어느 정도가 편한가요? 부담 없이 골라주세요.",
    opts: ENGLISH_OPTIONS,
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
    key: "major",
    kind: "text",
    ask: "학사 전공이 어떻게 되나요?",
    placeholder: "예: 환경공학",
  },
  {
    key: "experience",
    kind: "single",
    ask: "국제기구 관련 경력은 어느 정도인가요?",
    opts: EXPERIENCE_OPTIONS,
  },
  {
    key: "english",
    kind: "single",
    ask: "영어 업무 수행 수준은 어디에 가까운가요?",
    opts: ENGLISH_OPTIONS,
  },
  {
    key: "second",
    kind: "text",
    ask: "제2외국어가 있다면 알려주세요.",
    placeholder: "예: 프랑스어 B1, 없음",
    optional: true,
  },
  {
    key: "cert",
    kind: "text",
    ask: "가지고 있는 자격증이 있다면 적어주세요.",
    placeholder: "예: 정보처리기사, 없음",
    optional: true,
  },
  {
    key: "targetPath",
    kind: "single",
    ask: "관심 있는 진출 경로가 있나요?",
    opts: PATH_OPTIONS,
  },
];

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
    ask: "뉴스에서 보면 괜히 눈이 가는 장면은? (최대 2개)",
    opts: [
      { t: "녹아내리는 빙하와 사라지는 숲", tags: ["f:환경"] },
      { t: "물을 길으러 걷는 아이", tags: ["f:개발"] },
      { t: "국경에 선 난민 가족", tags: ["f:인권"] },
      { t: "백신을 기다리는 줄", tags: ["f:보건"] },
      { t: "무너진 학교를 다시 세우는 사람들", tags: ["f:교육"] },
      { t: "작은 나라의 수출 막힘", tags: ["f:경제"] },
    ],
  },
  {
    kind: "single",
    label: "끌리는 퀘스트",
    ask: "당신이 게임 속 캐릭터라면 더 끌리는 퀘스트는?",
    opts: [
      { t: "현장에 가서 바로 문제 해결하기" },
      { t: "큰 회의장에서 세계 규칙 바꾸기" },
    ],
  },
  {
    kind: "single",
    label: "세상을 바꾸는 순간",
    ask: '"세상을 바꾼다"는 말이 제일 실감 나는 순간은?',
    opts: [
      { t: "한 사람의 삶이 나아질 때" },
      { t: "법과 제도가 바뀔 때" },
      { t: "새로운 지식이 쌓일 때" },
      { t: "나라들이 합의할 때" },
    ],
  },
  {
    kind: "multi",
    max: 2,
    label: "끌리는 키워드",
    ask: "이런 키워드 중 왠지 끌리는 건? (최대 2개)",
    opts: [
      { t: "기후", tags: ["f:환경"] },
      { t: "평화", tags: ["f:평화"] },
      { t: "아동", tags: ["f:인권"] },
      { t: "보건", tags: ["f:보건"] },
      { t: "문화", tags: ["f:교육"] },
      { t: "무역", tags: ["f:경제"] },
      { t: "식량", tags: ["f:개발"] },
      { t: "기술", tags: ["f:기술"] },
    ],
  },
  {
    kind: "single",
    label: "맡는 역할",
    ask: "친구들이 당신에게 더 자주 맡기는 역할은?",
    opts: [
      { t: "자료 찾고 정리하는 사람" },
      { t: "사람들 의견 조율하는 사람" },
    ],
  },
  {
    kind: "single",
    label: "멋있는 일터",
    ask: "일하는 모습을 상상하면 더 멋있어 보이는 곳은?",
    opts: [
      { t: "재난 현장" },
      { t: "국제회의장" },
      { t: "연구실" },
      { t: "공항과 출장길" },
      { t: "온라인 상황실" },
    ],
  },
  {
    kind: "single",
    label: "마음이 가는 말",
    ask: "더 마음이 가는 말은?",
    opts: [
      { t: "지금 필요한 도움을 준다" },
      { t: "앞으로 반복될 문제를 막는다" },
    ],
  },
  {
    kind: "single",
    label: "알아보는 방식",
    ask: "새로운 분야를 알아볼 때 나는 보통?",
    opts: [
      { t: "짧은 카드뉴스부터 본다" },
      { t: "유튜브나 영상부터 본다" },
      { t: "챗봇에 물어본다" },
      { t: "공식 사이트를 파본다" },
    ],
  },
  {
    kind: "multi",
    max: 2,
    label: "재미있을 일",
    ask: "국제기구에서 해본다면 은근 재미있을 것 같은 일은? (최대 2개)",
    opts: [
      { t: "캠페인 만들기" },
      { t: "데이터 분석하기" },
      { t: "현장 프로젝트 운영" },
      { t: "번역·커뮤니케이션" },
      { t: "정책 제안" },
      { t: "국제행사 준비" },
    ],
  },
  {
    kind: "text",
    label: "한마디",
    ask: '"국제기구" 하면 떠오르는 이미지나 궁금한 점을 한 줄로 적어주세요. (선택)',
    placeholder: "예: UN은 정확히 무슨 일을 해요? / 환경 쪽이 궁금해요",
    optional: true,
  },
];

const ADVANCED_QUIZ: QuizStep[] = [
  {
    kind: "multi",
    max: 2,
    label: "관심 이슈",
    ask: "현재 가장 명확하게 관심 있는 국제 이슈는? (최대 2개)",
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
    label: "커리어 서사",
    ask: "본인의 커리어 서사에 더 가까운 방향은?",
    opts: [
      { t: "특정 현장·대상 문제를 깊게 해결" },
      { t: "제도·정책·국제규범을 설계" },
    ],
  },
  {
    kind: "single",
    label: "지원서 강점",
    ask: "지원서에서 가장 강점으로 내세울 수 있는 역량은?",
    opts: [
      { t: "리서치·문서작성" },
      { t: "데이터 분석" },
      { t: "프로젝트 운영" },
      { t: "이해관계자 조율" },
      { t: "커뮤니케이션·홍보" },
      { t: "법·정책 해석" },
    ],
  },
  {
    kind: "multi",
    max: 2,
    label: "진출 경로",
    ask: "관심 있는 진출 경로는? (최대 2개)",
    opts: [
      { t: "인턴십" },
      { t: "JPO" },
      { t: "UNV" },
      { t: "YPP" },
      { t: "컨설턴트" },
      { t: "NGO·개발협력 경유" },
      { t: "아직 모르겠다" },
    ],
  },
  {
    kind: "single",
    label: "공고 선택 기준",
    ask: "공고를 고를 때 더 중요한 기준은?",
    opts: [
      { t: "내 관심 분야와의 적합성" },
      { t: "내가 실제로 지원 가능한 자격요건" },
    ],
  },
  {
    kind: "single",
    label: "현재 병목",
    ask: "현재 국제기구 지원에서 가장 막히는 부분은?",
    opts: [
      { t: "어떤 기구가 맞는지 모름" },
      { t: "공고 찾기 번거로움" },
      { t: "자격요건 해석 어려움" },
      { t: "경력 부족" },
      { t: "언어 부담" },
      { t: "지원서 작성 부담" },
    ],
  },
  {
    kind: "single",
    label: "선호 조직 유형",
    ask: "선호하는 조직 유형은?",
    opts: [
      { t: "UNDP·UNICEF처럼 넓은 의제를 다루는 대형 기구" },
      { t: "ILO·WIPO·IMO처럼 분야가 뚜렷한 전문 기구" },
    ],
  },
  {
    kind: "single",
    label: "영어 업무 수준",
    ask: "영어 업무 수행 수준은 어디에 가까운가요?",
    opts: [
      ...ENGLISH_OPTIONS.map((t) => ({ t })),
      { t: "영어보다 제2외국어가 강점" },
    ],
  },
  {
    kind: "multi",
    max: 2,
    label: "받고 싶은 정보",
    ask: "맞춤 정보로 받고 싶은 것은? (최대 2개)",
    opts: [
      { t: "내 분야 공고" },
      { t: "관심 기구 새 공고" },
      { t: "국제 뉴스·정세" },
      { t: "지원자격 체크" },
      { t: "유사 기구 추천" },
      { t: "필요한 역량 요약" },
    ],
  },
  {
    kind: "text",
    label: "목표와 고민",
    ask: "마음에 둔 기구·직무·분야 또는 현재 고민을 적어주세요. (선택)",
    placeholder: "예: UNEP 환경정책 인턴 관심, JPO 자격이 되는지 궁금해요",
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
  status: "현재 상태",
  major: "전공/관심",
  english: "영어 수준",
  experience: "관련 경력",
  second: "제2외국어",
  cert: "자격증",
  targetPath: "진출 경로",
};

// ===== 백엔드 전송용 프로필 텍스트 빌드 =====
export function buildProfile(
  profile: ProfileSummary,
  answers: Answer[],
  track: CompassTrack,
): BuiltProfile {
  const flow = FLOWS[track];

  const profileLines: string[] = [];
  if (profile.nick) profileLines.push(`- 닉네임: ${profile.nick}`);
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
