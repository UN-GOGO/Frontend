import { createClient } from "@/lib/supabase/client";

// 알림(주간 이메일 다이제스트) 설정 — Supabase user_preferences에 직접 read/write.
// 백엔드(pipeline/weekly_digest.py)는 매주 월요일,
//   enable_notifications = true  AND  notification_frequency = 'weekly'
// 인 유저를 골라 user_preferences.email 주소로 메일을 보낸다.
// 따라서 이 세 컬럼만 저장하면 발송 파이프라인과 그대로 연동된다.

export type NotificationPrefs = {
  enableNotifications: boolean;
  email: string;
};

export type LoadResult = {
  authed: boolean;
  prefs: NotificationPrefs;
};

/**
 * 현재 로그인 유저의 알림 설정을 불러온다.
 * - 행이 없으면 기본값(수신 ON, 이메일=계정 이메일)을 돌려준다.
 * - 비로그인 상태면 authed=false.
 */
export async function getNotificationPrefs(): Promise<LoadResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authed: false, prefs: { enableNotifications: true, email: "" } };
  }

  const { data } = await supabase
    .from("user_preferences")
    .select("enable_notifications, email")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    authed: true,
    prefs: {
      enableNotifications: data?.enable_notifications ?? true,
      email: data?.email ?? user.email ?? "",
    },
  };
}

export type SaveResult = { ok: boolean; error?: string };

/**
 * 알림 설정을 user_preferences에 upsert한다(유저당 1행).
 * notification_frequency는 백엔드가 'weekly'만 처리하므로 고정.
 */
export async function saveNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<SaveResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "not_authenticated" };

    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        enable_notifications: prefs.enableNotifications,
        notification_frequency: "weekly",
        email: prefs.email.trim() || user.email || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
