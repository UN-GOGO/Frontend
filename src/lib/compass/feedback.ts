import { apiPost } from "@/lib/api/client";

// 나침반 결과에 대한 간단 피드백 — 백엔드 POST /compass/feedback
// (이모지 + 한 줄 의견 → Supabase compass_feedback 테이블에 저장)
export async function sendCompassFeedback(
  emoji: string,
  text?: string,
): Promise<boolean> {
  try {
    await apiPost<{ emoji: string; text?: string }, { ok: boolean }>(
      "/compass/feedback",
      { emoji, text: text?.trim() || undefined },
    );
    return true;
  } catch {
    return false;
  }
}
