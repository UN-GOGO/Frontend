"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  CalendarDays,
  Check,
  Clock,
  Mail,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

import {
  getNotificationPrefs,
  saveNotificationPrefs,
} from "@/lib/notifications/preferences";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
  type NotificationType,
} from "@/lib/notifications/feed";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  deadline: Clock,
  newjob: Briefcase,
  news: Newspaper,
  event: CalendarDays,
};

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "focus-visible:ring-point relative h-6 w-11 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 disabled:opacity-50",
        on ? "bg-point" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
          on && "translate-x-5",
        )}
      />
    </button>
  );
}

export function NotificationsClient() {
  // 알림 설정 — user_preferences 연동(주간 이메일 다이제스트)
  const [enabled, setEnabled] = useState(true);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<"ok" | "err" | null>(null);

  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const hasUnread = notifs.some((n) => !n.isRead);

  const markAllRead = async () => {
    setNotifs((list) => list.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsRead();
  };

  useEffect(() => {
    (async () => {
      const { authed, prefs } = await getNotificationPrefs();
      setAuthed(authed);
      setEnabled(prefs.enableNotifications);
      setEmail(prefs.email);
      setLoading(false);

      const items = await getNotifications();
      setNotifs(items);
      setFeedLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setSavedMsg(null);
    const res = await saveNotificationPrefs({
      enableNotifications: enabled,
      email,
    });
    setSaving(false);
    setSavedMsg(res.ok ? "ok" : "err");
    if (res.ok) setTimeout(() => setSavedMsg(null), 2400);
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-8">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-primary text-2xl font-extrabold tracking-tight">
            알림
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            매주 월요일, 새 뉴스·공고를 이메일로 받아보세요.
          </p>
        </div>
        {hasUnread && (
          <button
            type="button"
            onClick={markAllRead}
            className="border-border text-point-hover hover:border-point-border shrink-0 rounded-[9px] border bg-white px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* Weekly email digest settings */}
      <div className="border-border bg-card mb-6 rounded-2xl border p-5">
        <div className="text-primary mb-1 text-xs font-extrabold">
          알림 설정
        </div>

        {!authed && !loading && (
          <p className="text-muted-foreground border-border mt-3 rounded-[10px] border border-dashed px-4 py-3 text-xs">
            로그인하면 알림 설정을 저장할 수 있어요.
          </p>
        )}

        {/* Master toggle */}
        <div className="border-border/70 flex items-center justify-between gap-4 border-t py-4 first:border-t-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-point-soft text-point-hover flex size-9 shrink-0 items-center justify-center rounded-[10px]">
              <Mail className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <div className="text-foreground text-sm font-bold">
                주간 이메일 다이제스트
              </div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                관심 분야의 새 뉴스·공고 TOP5를 매주 보내드려요.
              </div>
            </div>
          </div>
          <Toggle
            on={enabled}
            onClick={() => setEnabled((v) => !v)}
            disabled={loading || !authed}
          />
        </div>

        {/* Email */}
        <div className="border-border/70 border-t py-4">
          <label className="text-muted-foreground text-xs font-semibold">
            수신 이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || !authed || !enabled}
            placeholder="example@email.com"
            className="border-border text-foreground placeholder:text-muted-foreground focus:border-point mt-1.5 w-full max-w-[360px] rounded-[11px] border-[1.5px] px-3.5 py-2.5 text-sm outline-none disabled:opacity-50"
          />
          <p className="text-muted-foreground mt-1.5 text-[11px]">
            비워두면 가입한 계정 이메일로 발송됩니다.
          </p>
        </div>

        {/* Save */}
        <div className="border-border/70 flex items-center gap-3 border-t pt-4">
          <button
            type="button"
            onClick={save}
            disabled={loading || !authed || saving}
            className="bg-primary hover:bg-point-hover rounded-[11px] px-5 py-2.5 text-[13px] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
          {savedMsg === "ok" && (
            <span className="text-point-hover inline-flex items-center gap-1 text-sm font-semibold">
              <Check className="size-4" />
              저장됐어요
            </span>
          )}
          {savedMsg === "err" && (
            <span className="text-destructive text-sm font-medium">
              저장 실패 — 다시 시도해 주세요.
            </span>
          )}
        </div>
      </div>

      {/* Notification feed */}
      {feedLoading ? (
        <div className="text-muted-foreground px-5 py-14 text-center text-sm">
          알림을 불러오는 중…
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center px-5 py-14 text-center">
          <Bell className="mb-2 size-7 opacity-40" />
          <div className="text-sm font-bold">새로운 알림이 없습니다.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifs.map((n) => (
            <NotificationRow
              key={n.id}
              item={n}
              onRead={(id) => {
                setNotifs((list) =>
                  list.map((x) => (x.id === id ? { ...x, isRead: true } : x)),
                );
                void markNotificationRead(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}) {
  const Icon = TYPE_ICON[item.type] ?? Bell;
  const inner = (
    <>
      <span className="bg-point-soft text-point-hover flex size-10 shrink-0 items-center justify-center rounded-xl">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-foreground text-sm leading-snug font-bold">
          {item.title}
        </div>
        {item.body && (
          <div className="text-muted-foreground mt-0.5 text-xs leading-snug">
            {item.body}
          </div>
        )}
        <div className="text-muted-foreground mt-1 font-mono text-[12px]">
          {formatTime(item.createdAt)}
        </div>
      </div>
      {!item.isRead && (
        <span className="bg-point size-2 shrink-0 rounded-full" />
      )}
    </>
  );

  const className = cn(
    "border-border bg-card hover:border-point-border flex w-full items-center gap-3 rounded-[14px] border p-4 text-left transition-colors",
    !item.isRead && "bg-point-soft/30",
  );

  if (item.linkUrl) {
    return (
      <Link
        href={item.linkUrl}
        onClick={() => !item.isRead && onRead(item.id)}
        className={className}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => !item.isRead && onRead(item.id)}
      className={className}
    >
      {inner}
    </button>
  );
}
