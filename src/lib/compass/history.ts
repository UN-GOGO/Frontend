import { createClient } from "@/lib/supabase/client";

import type { ExploreGroup, ProfileSummary, Recommendation } from "./types";

// 나침반 진단 이력 — Supabase navigator_results에서 본인 행만 읽는다(RLS).
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
  limit = 5,
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
      .select(
        "id, needle_label, advice, recommendations, explore, is_ai, created_at, profile_input",
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) return null;

    return {
      id: data.id as string,
      needleLabel: data.needle_label as string | null,
      advice: data.advice as string | null,
      recommendations: (data.recommendations ?? []) as Recommendation[],
      explore: (data.explore ?? []) as ExploreGroup[],
      isAi: Boolean(data.is_ai),
      createdAt: data.created_at as string,
      profileInput: (data.profile_input ?? {
        nick: "",
        major: "",
        degree: "",
        exp: "",
        english: "",
        second: "",
      }) as ProfileSummary,
    };
  } catch {
    return null;
  }
}
