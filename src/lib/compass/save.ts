import { createClient } from "@/lib/supabase/client";

import type { Answer, ProfileSummary, RecommendResponse } from "./types";

export type SaveResult = { ok: boolean; error?: string };

// 프로필 저장(나침반 ↔ 마이페이지 정본)은 profile-store.ts 의
// saveCompassProfile / loadCompassProfile 로 통합되었다. 이 파일은 추천 이력 저장만 담당.

/**
 * 나침반 추천 결과를 Supabase(navigator_results)에 저장한다.
 * - 로그인 상태가 아니면 저장하지 않고 조용히 반환한다(베스트 에포트).
 * - 한 사람당 1행만 유지. 나침반을 다시 하면 기존 결과를 덮어쓴다
 *   (user_id UNIQUE 제약 기준 upsert). 이력은 누적하지 않는다.
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

    const { error } = await supabase.from("navigator_results").upsert(
      {
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
      },
      { onConflict: "user_id" },
    );

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
