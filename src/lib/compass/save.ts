import { createClient } from "@/lib/supabase/client";

import type { Answer, ProfileSummary, RecommendResponse } from "./types";

export type SaveResult = { ok: boolean; error?: string };

/**
 * 나침반 추천 결과를 Supabase(navigator_results)에 저장한다.
 * - 로그인 상태가 아니면 저장하지 않고 조용히 반환한다(베스트 에포트).
 * - 추천 1회 실행 = 1행(이력 누적).
 */
export async function saveCompassResult(params: {
  profileInput: ProfileSummary;
  profileText: string;
  answers: Answer[];
  data: RecommendResponse;
  isAI: boolean;
}): Promise<SaveResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, error: "not_authenticated" };

    const { error } = await supabase.from("navigator_results").insert({
      user_id: user.id,
      profile_input: params.profileInput,
      profile_text: params.profileText,
      answers: params.answers,
      result_summary: params.data.profile_summary ?? null,
      needle_label: params.data.needle_label ?? null,
      advice: params.data.advice ?? null,
      recommendations: params.data.recommendations,
      explore: params.data.explore ?? [],
      is_ai: params.isAI,
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
