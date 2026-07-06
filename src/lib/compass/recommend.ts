import { apiPost } from "@/lib/api/client";

import { ruleBased } from "./fallback";
import type { Answer, CompassTrack, RecommendResponse } from "./types";

export type RecommendResult = {
  data: RecommendResponse;
  /** true = 백엔드 AI 추천 / false = 오프라인 규칙기반 폴백 */
  isAI: boolean;
  /**
   * 규칙기반으로 떨어진 이유가 "진짜 실패"가 아니라 응답 지연(타임아웃)이었는지.
   * 백엔드는 살아있고 결국 성공했을 가능성이 높다는 뜻이라, 화면에서
   * "오프라인 폴백"과 다르게 안내해야 한다.
   */
  timedOut?: boolean;
};

// LLM 추천 호출은 콜드 스타트·모델 응답 지연으로 API 기본 타임아웃(30s)도 쉽게
// 넘긴다. 여유 있게 잡아야 "느리지만 결국 성공"하는 AI 응답이 타임아웃 때문에
// 규칙기반으로 조용히 강등되는 걸 막을 수 있다.
const RECOMMEND_TIMEOUT_MS = 45000;

/**
 * 프로필 텍스트로 추천을 요청한다.
 * 백엔드 실패(미동작·네트워크·타임아웃) 시 규칙기반 폴백으로 자동 전환한다.
 */
export async function getRecommendation(
  profileText: string,
  answers: Answer[],
  track: CompassTrack,
  init?: { signal?: AbortSignal },
): Promise<RecommendResult> {
  try {
    const data = await apiPost<{ profile: string }, RecommendResponse>(
      "/compass/recommend",
      { profile: profileText },
      { ...init, timeoutMs: RECOMMEND_TIMEOUT_MS },
    );
    if (!data?.recommendations?.length) throw new Error("empty");
    return { data, isAI: true };
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "TimeoutError";
    if (!timedOut) console.error("나침반 추천 요청 실패:", e);
    return { data: ruleBased(answers, track), isAI: false, timedOut };
  }
}
