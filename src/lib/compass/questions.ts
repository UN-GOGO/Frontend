import type { Answer, BuiltProfile, ProfileSummary, Question } from "./types";

// ===== 퀴즈 문항 — 재설계 초안 (시나리오·강제선택·복수선택·자유서술 혼합) =====
// tags 는 백엔드 미동작 시 폴백 채점용.
export const QUESTIONS: Question[] = [
  {
    type: "multi",
    max: 2,
    label: "마음을 끄는 장면",
    q: "아래 장면 중 당신의 마음을 가장 끌어당기는 것은? (최대 2개)",
    opts: [
      { t: "녹아내리는 빙하와 사라지는 숲", tags: ["f:환경"] },
      { t: "깨끗한 물 한 통을 위해 몇 시간을 걷는 아이", tags: ["f:개발"] },
      { t: "국경에서 보호를 기다리는 사람들", tags: ["f:인권"] },
      { t: "백신을 기다리는 긴 줄", tags: ["f:보건"] },
      { t: "무너진 학교를 다시 세우는 사람들", tags: ["f:교육"] },
      { t: "불공정한 규칙에 막힌 작은 나라의 상인", tags: ["f:경제"] },
    ],
  },
  {
    type: "single",
    label: "일의 결",
    q: "둘 중 더 하고 싶은 일은?",
    opts: [
      { t: "한 마을의 식수 문제를 내 손으로 직접 해결한다", tags: ["a:현장"] },
      { t: '100개국에 적용될 식수 "기준"을 설계한다', tags: ["a:정책"] },
    ],
  },
  {
    type: "single",
    label: "회의 속 내 자리",
    q: "국제회의에 들어간다면, 당신은?",
    opts: [
      { t: "데이터로 근거를 만드는 분석가", tags: ["a:연구"] },
      { t: "이해관계를 조율하는 중재자", tags: ["a:협상"] },
    ],
  },
  {
    type: "single",
    label: "뿌듯한 성과",
    q: "1년 뒤, 가장 뿌듯할 성과는?",
    opts: [
      { t: "당장 도운 사람의 수", tags: ["f:보건", "a:현장"] },
      { t: "바뀐 제도와 법", tags: ["f:개발", "a:정책"] },
      { t: "쌓아 올린 지식·데이터", tags: ["f:교육", "a:연구"] },
      { t: "맺어진 국제 합의", tags: ["f:인권", "a:협상"] },
    ],
  },
  {
    type: "single",
    label: "설레는 근무 풍경",
    q: "상상만 해도 설레는 근무 풍경은?",
    opts: [
      { t: "현장의 텐트와 트럭 사이", tags: ["s:인도", "r:현장"] },
      { t: "본부의 큰 회의실", tags: ["s:대형", "r:미국"] },
      { t: "조용한 연구실의 모니터 앞", tags: ["s:기술", "a:연구"] },
      { t: "여러 나라를 오가는 출장길", tags: ["a:협상", "r:유럽"] },
    ],
  },
  {
    type: "single",
    label: "끌리는 조직 크기",
    q: "더 끌리는 조직은?",
    opts: [
      { t: "수만 명이 큰 그림을 그리는 대형 기구", tags: ["s:대형"] },
      { t: "소수 전문가가 깊게 파는 전문 기구", tags: ["s:기술"] },
    ],
  },
  {
    type: "single",
    label: "끌린 진짜 이유",
    q: "국제기구에 끌린 진짜 이유에 가장 가까운 것은?",
    opts: [
      { t: "세상을 바꾸는 글로벌 임팩트", tags: [] },
      { t: "다양한 문화 속에서 일하는 삶", tags: [] },
      { t: "한 분야의 세계적 전문가로 인정받기", tags: ["s:기술"] },
      { t: "안정 속에서 의미 있는 일", tags: [] },
    ],
  },
  {
    type: "single",
    label: "현실적 출발점",
    q: "지금 나에게 더 현실적인 출발점은?",
    opts: [
      { t: "인턴십으로 일단 발 담그기", tags: ["p:인턴십"] },
      { t: "석사 후 JPO·YPP 정공법", tags: ["p:JPO"] },
      { t: "경력 쌓아 경력직으로", tags: ["p:경력"] },
    ],
  },
  {
    type: "text",
    label: "한마디",
    q: "꼭 해보고 싶은 일이나 마음에 둔 기구가 있다면 한 줄로 적어주세요. (선택)",
    placeholder: "예: 기후 협상에 참여하고 싶어요 / UNHCR이 궁금해요",
  },
];

export const EMPTY_PROFILE: ProfileSummary = {
  nick: "",
  major: "",
  degree: "",
  exp: "",
  english: "",
  second: "",
};

/** 퀴즈 답변 + 인트로 프로필 → LLM이 의미로 읽는 자연어 텍스트 */
export function buildProfile(
  summary: ProfileSummary,
  answers: Answer[],
): BuiltProfile {
  const lines: string[] = [];
  answers.forEach((a, qi) => {
    const Q = QUESTIONS[qi];
    if (a == null || a === "") return;
    if (Q.type === "text") {
      lines.push(`- ${Q.label}: ${a as string}`);
    } else if (Q.type === "multi") {
      if (Array.isArray(a) && a.length) {
        lines.push(`- ${Q.label}: ${a.map((i) => Q.opts[i].t).join(", ")}`);
      }
    } else {
      lines.push(`- ${Q.label}: ${Q.opts[a as number].t}`);
    }
  });

  const head: string[] = [];
  if (summary.nick) head.push(`닉네임: ${summary.nick}`);
  if (summary.major) head.push(`전공/관심학문: ${summary.major}`);
  if (summary.degree) head.push(`학력: ${summary.degree}`);
  if (summary.exp) head.push(`관련 경험: ${summary.exp}`);
  if (summary.english) head.push(`영어 수준: ${summary.english}`);
  if (summary.second) head.push(`제2외국어: ${summary.second}`);

  const text = (head.length ? head.join(". ") + ".\n" : "") + lines.join("\n");
  return { text, summary };
}
