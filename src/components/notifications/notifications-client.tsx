"use client";

import { useEffect, useState } from "react";
import { Check, Mail } from "lucide-react";

import {
  getNotificationPrefs,
  saveNotificationPrefs,
} from "@/lib/notifications/preferences";
import { cn } from "@/lib/utils";

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
  const [savedMsg, setSavedMsg] = useState<"ok" | "err" | "empty" | null>(null);

  // 알림이 켜져 있으면 수신 이메일은 필수. 비어 있으면 저장 불가.
  const emailRequired = enabled && email.trim() === "";

  useEffect(() => {
    (async () => {
      const { authed, prefs } = await getNotificationPrefs();
      setAuthed(authed);
      setEnabled(prefs.enableNotifications);
      setEmail(prefs.email);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    // 수신 이메일이 비어 있으면 저장하지 않고 안내만 표시.
    if (emailRequired) {
      setSavedMsg("empty");
      return;
    }
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
      <div className="mb-5">
        <h1 className="text-primary text-2xl font-extrabold tracking-tight">
          알림
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          매주 월요일, 새 뉴스를 이메일로 받아보세요.
        </p>
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
                주간 이메일
              </div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                관심 분야의 새 뉴스 TOP3를 매주 월요일에 보내드려요.
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
          <label className="text-muted-foreground text-sm font-semibold">
            수신 이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (savedMsg === "empty") setSavedMsg(null);
            }}
            disabled={loading || !authed || !enabled}
            placeholder="example@email.com"
            aria-invalid={savedMsg === "empty"}
            className="border-border text-foreground placeholder:text-muted-foreground focus:border-point aria-invalid:border-destructive mt-1.5 ml-3 w-full max-w-[360px] rounded-[11px] border-[1.5px] px-3.5 py-2.5 text-sm outline-none disabled:opacity-50"
          />
          {savedMsg === "empty" && (
            <p className="text-destructive mt-1.5 ml-3 text-xs">
              수신 이메일을 입력해 주세요.
            </p>
          )}
        </div>

        {/* Save */}
        <div className="border-border/70 flex items-center gap-3 border-t pt-4">
          <button
            type="button"
            onClick={save}
            disabled={loading || !authed || saving || emailRequired}
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
    </div>
  );
}
