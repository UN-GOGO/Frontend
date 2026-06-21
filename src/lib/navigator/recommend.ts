import { apiPost } from "@/lib/api/client";

import { ruleBased } from "./fallback";
import type { Answer, RecommendResponse } from "./types";

export type RecommendResult = {
  data: RecommendResponse;
  /** true = 백엔드 AI 추천 / false = 오프라인 규칙기반 폴백 */
  isAI: boolean;
};

/**
 * 프로필 텍스트로 추천을 요청한다.
 * 백엔드 실패(미동작·네트워크) 시 규칙기반 폴백으로 자동 전환한다.
 */
export async function getRecommendation(
  profileText: string,
  answers: Answer[],
  init?: { signal?: AbortSignal },
): Promise<RecommendResult> {
  try {
    const data = await apiPost<{ profile: string }, RecommendResponse>(
      "/recommend",
      { profile: profileText },
      init,
    );
    if (!data?.recommendations?.length) throw new Error("empty");
    return { data, isAI: true };
  } catch {
    return { data: ruleBased(answers), isAI: false };
  }
}
