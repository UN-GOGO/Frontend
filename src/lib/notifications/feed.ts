import { createClient } from "@/lib/supabase/client";

// 알림 피드 — Supabase notifications에서 본인 행만 읽고/읽음 처리(RLS).

export type NotificationType = "deadline" | "newjob" | "news" | "event";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

export async function getNotifications(
  limit = 30,
): Promise<NotificationItem[]> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, link_url, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id as string,
      type: r.type as NotificationType,
      title: r.title as string,
      body: (r.body ?? null) as string | null,
      linkUrl: (r.link_url ?? null) as string | null,
      isRead: Boolean(r.is_read),
      createdAt: r.created_at as string,
    }));
  } catch {
    return [];
  }
}

export async function markAllNotificationsRead(): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    return !error;
  } catch {
    return false;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  } catch {
    // 무시 — UI는 낙관적으로 처리
  }
}
