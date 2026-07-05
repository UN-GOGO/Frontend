import { apiPost } from "@/lib/api/client";

// 콜드 스타트 등으로 기본 타임아웃(15s)을 넘길 수 있어 여유를 둔다.
const FEEDBACK_TIMEOUT_MS = 20000;

// 나침반 결과에 대한 간단 피드백 — 백엔드 POST /compass/feedback
// (이모지 + 한 줄 의견 → Supabase compass_feedback 테이블에 저장)
// 베스트 에포트: 실패해도 화면 흐름은 막지 않고 false만 돌려준다.
export async function sendCompassFeedback(
  emoji: string,
  text?: string,
): Promise<boolean> {
  try {
    await apiPost<{ emoji: string; text?: string }, { ok: boolean }>(
      "/compass/feedback",
      { emoji, text: text?.trim() || undefined },
      { timeoutMs: FEEDBACK_TIMEOUT_MS },
    );
    return true;
  } catch (e) {
    // 타임아웃이 아닌 진짜 실패만 로그로 남긴다(디버깅용, 화면엔 노출 안 함).
    if (!(e instanceof Error && e.name === "TimeoutError")) {
      console.error("나침반 피드백 전송 실패:", e);
    }
    return false;
  }
}
