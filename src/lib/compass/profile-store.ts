// 나침반 프로필 "정본(canonical)" 저장/로드 레이어.
//
// 설계(2026-07-04, 통합): 나침반 ↔ 마이페이지 프로필 양방향 동기화.
//   - 정본 = Supabase `navigator_results`(user_id당 1행, 008 UNIQUE)의
//     profile_input(jsonb)에 ProfileSummary 통째로 저장.
//     → 별도 compass_profiles 없이 결과 저장소와 프로필 정본을 한 행으로 통합.
//   - 나침반 완료 저장·마이페이지 폼 저장 모두 이 saveCompassProfile 하나로 upsert.
//   - 백엔드 /profile(languages[]·experience[])은 챗봇·인사이트 개인화용 "파생" 사본으로,
//     여기서 베스트 에포트로 함께 갱신한다(실패해도 정본은 저장됨).
//   - 게스트(비로그인)는 저장하지 않고 조용히 반환한다.

import { updateProfile } from "@/lib/api/iogo";
import { createClient } from "@/lib/supabase/client";

import { EMPTY_PROFILE } from "./flows";
import type { ProfileSummary } from "./types";

export type SaveResult = { ok: boolean; error?: string };

/** 정본 ProfileSummary → 백엔드 Profile(개인화용) 파생 매핑. 손실이 있어도 무방(정본은 별도). */
function toBackendProfile(p: ProfileSummary) {
  const languages = [
    p.english_level && `영어: ${p.english_level}`,
    p.second_language && `제2외국어: ${p.second_language}`,
  ].filter(Boolean) as string[];
  const experience = [
    p.experience_years && `경력: ${p.experience_years}`,
    p.cert && `자격증: ${p.cert}`,
    p.target_path && `진출경로: ${p.target_path}`,
  ].filter(Boolean) as string[];
  return {
    education: p.status || null,
    major:
      (p.track === "interest" ? p.interest_hint : p.bachelor_major) || null,
    languages,
    experience,
  };
}

/**
 * 나침반 프로필을 정본으로 저장한다(프로필 수정 페이지에서 "내 프로필"로 명시 저장).
 * - navigator_results.profile_input upsert(무손실) → user_id당 1행.
 *   부분 컬럼만 갱신하므로 기존 진단 결과(추천 등)는 보존된다.
 * - 챗봇·인사이트 개인화용 파생 프로필(users)도 동기화(베스트 에포트).
 *   이 경로는 명백히 본인 프로필이므로 users 동기화가 안전하다(나침반 완료 흐름은 동기화 안 함).
 * - 비로그인이면 저장하지 않고 반환.
 */
export async function saveCompassProfile(
  p: ProfileSummary,
): Promise<SaveResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "not_authenticated" };

    const { error } = await supabase.from("navigator_results").upsert(
      {
        user_id: user.id,
        profile_input: p,
      },
      { onConflict: "user_id" },
    );
    if (error) return { ok: false, error: error.message };

    // 챗봇·인사이트 개인화용 파생 프로필 동기화(정본 저장과 독립, 실패해도 무방)
    void updateProfile(user.id, toBackendProfile(p)).catch(() => {});
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * 저장된 정본 프로필을 불러온다.
 * - 로그인 유저의 navigator_results 1행의 profile_input을 ProfileSummary로 복원.
 * - 없거나 게스트면 null. 스키마가 늘어나도 안전하도록 EMPTY_PROFILE에 병합.
 */
export async function loadCompassProfile(): Promise<ProfileSummary | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("navigator_results")
      .select("profile_input")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data?.profile_input) return null;

    return {
      ...EMPTY_PROFILE,
      ...(data.profile_input as Partial<ProfileSummary>),
    };
  } catch {
    return null;
  }
}
