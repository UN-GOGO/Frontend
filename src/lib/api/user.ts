import { createClient } from "@/lib/supabase/client";

const TEST_KEY = "iogo_test_user_id";

/**
 * 백엔드(un-gogo) 호출에 쓸 user_id.
 * 로그인 상태면 Supabase 유저 id를, 아니면 연결 테스트용으로
 * 브라우저에 저장된 임시 UUID를 돌려준다.
 */
export async function getUserId(): Promise<string> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;
  } catch {
    // 무시하고 폴백
  }

  if (typeof window !== "undefined") {
    let id = window.localStorage.getItem(TEST_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(TEST_KEY, id);
    }
    return id;
  }

  return "00000000-0000-0000-0000-000000000000";
}
