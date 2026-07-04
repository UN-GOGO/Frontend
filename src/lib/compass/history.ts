import { createClient } from "@/lib/supabase/client";

import { EMPTY_PROFILE } from "./flows";
import type { ExploreGroup, ProfileSummary, Recommendation } from "./types";

// 나침반 결과 조회 — Supabase navigator_results에서 본인 행만 읽는다(RLS).
// 한 사람당 1행만 유지되므로(save.ts upsert) 실질적으로 최신 결과 1건이다.
// 저장은 save.ts(saveCompassResult)에서, 조회는 여기서.

export type NavigatorResult = {
  id: string;
  needleLabel: string | null;
  advice: string | null;
  recommendations: Recommendation[];
  isAi: boolean;
  createdAt: string;
};

export async function getNavigatorResults(
  limit = 1,
): Promise<NavigatorResult[]> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("navigator_results")
      .select("id, needle_label, advice, recommendations, is_ai, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id as string,
      needleLabel: r.needle_label as string | null,
      advice: r.advice as string | null,
      recommendations: (r.recommendations ?? []) as Recommendation[],
      isAi: Boolean(r.is_ai),
      createdAt: r.created_at as string,
    }));
  } catch {
    return [];
  }
}

// ===== 결과 1건 상세 (결과 페이지처럼 펼쳐보기용) =====

export type NavigatorResultDetail = NavigatorResult & {
  profileInput: ProfileSummary;
  explore: ExploreGroup[];
};

const RESULT_DETAIL_COLUMNS =
  "id, needle_label, advice, recommendations, explore, is_ai, created_at, profile_input";

type ResultDetailRow = {
  id: string;
  needle_label: string | null;
  advice: string | null;
  recommendations: Recommendation[] | null;
  explore: ExploreGroup[] | null;
  is_ai: boolean | null;
  created_at: string;
  profile_input: ProfileSummary | null;
};

function toDetail(data: ResultDetailRow): NavigatorResultDetail {
  return {
    id: data.id,
    needleLabel: data.needle_label,
    advice: data.advice,
    recommendations: (data.recommendations ?? []) as Recommendation[],
    explore: (data.explore ?? []) as ExploreGroup[],
    isAi: Boolean(data.is_ai),
    createdAt: data.created_at,
    profileInput: (data.profile_input ?? EMPTY_PROFILE) as ProfileSummary,
  };
}

export async function getNavigatorResult(
  id: string,
): Promise<NavigatorResultDetail | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("navigator_results")
      .select(RESULT_DETAIL_COLUMNS)
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) return null;

    return toDetail(data as ResultDetailRow);
  } catch {
    return null;
  }
}

// 로그인 유저의 최신 나침반 결과 1건(상세). id를 몰라도 열 수 있게 한다.
// navigator_results는 한 사람당 1행이므로 이 함수가 곧 "내 결과"다.
export async function getLatestNavigatorResult(): Promise<NavigatorResultDetail | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("navigator_results")
      .select(RESULT_DETAIL_COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;

    const detail = toDetail(data as ResultDetailRow);
    // 프로필만 저장돼 진단 결과가 아직 없는 행이면 "결과 없음"으로 취급한다.
    if (detail.recommendations.length === 0) return null;
    return detail;
  } catch {
    return null;
  }
}
