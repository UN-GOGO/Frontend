"use client";

import { useState } from "react";
import {
  Briefcase,
  CalendarDays,
  Clock,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type SubKey = "deadline" | "newjob" | "news" | "event";

const SUBS: {
  key: SubKey;
  icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  {
    key: "deadline",
    icon: Clock,
    title: "마감 임박 알림",
    desc: "관심 공고 마감 3일 전에 알려드려요.",
  },
  {
    key: "newjob",
    icon: Briefcase,
    title: "신규 공석 알림",
    desc: "내 조건에 맞는 새 공석이 등록되면 알려드려요.",
  },
  {
    key: "news",
    icon: Newspaper,
    title: "추천 뉴스",
    desc: "관심 키워드 관련 새 인사이트를 모아드려요.",
  },
  {
    key: "event",
    icon: CalendarDays,
    title: "행사·프로그램",
    desc: "설명회·캠프 등 신규 일정을 알려드려요.",
  },
];

type Notif = {
  id: string;
  icon: LucideIcon;
  title: string;
  time: string;
  unread: boolean;
};

const INITIAL_NOTIFS: Notif[] = [
  {
    id: "n1",
    icon: Briefcase,
    title: "UNDP 서울정책센터 인턴 공고가 새로 등록되었어요.",
    time: "2026.06.27 09:12",
    unread: true,
  },
  {
    id: "n2",
    icon: Clock,
    title: "WFP 영양 프로그램 담당관 공고가 3일 후 마감돼요.",
    time: "2026.06.26 18:40",
    unread: true,
  },
  {
    id: "n3",
    icon: Newspaper,
    title: "관심 키워드 「기후·SDG」 관련 새 인사이트 3건이 도착했어요.",
    time: "2026.06.25 10:05",
    unread: false,
  },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "focus-visible:ring-point relative h-6 w-11 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2",
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
  const [subs, setSubs] = useState<Record<SubKey, boolean>>({
    deadline: true,
    newjob: true,
    news: true,
    event: false,
  });
  const [channel, setChannel] = useState<"app" | "email">("app");
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);

  const hasUnread = notifs.some((n) => n.unread);

  const toggleSub = (k: SubKey) => setSubs((s) => ({ ...s, [k]: !s[k] }));
  const markAllRead = () =>
    setNotifs((list) => list.map((n) => ({ ...n, unread: false })));

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-8">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-primary text-2xl font-extrabold tracking-tight">
            알림
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            마감 임박·신규 공석·추천·행사 알림을 모아봅니다.
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

      {/* Subscription settings */}
      <div className="border-border bg-card mb-6 rounded-2xl border px-5 py-2">
        <div className="text-primary py-3 text-xs font-extrabold">
          알림 구독 설정
        </div>
        {SUBS.map(({ key, icon: Icon, title, desc }) => (
          <div
            key={key}
            className="border-border/70 flex items-center justify-between gap-4 border-t py-3.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-point-soft text-point-hover flex size-9 shrink-0 items-center justify-center rounded-[10px]">
                <Icon className="size-[18px]" />
              </span>
              <div className="min-w-0">
                <div className="text-foreground text-sm font-bold">{title}</div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  {desc}
                </div>
              </div>
            </div>
            <Toggle on={subs[key]} onClick={() => toggleSub(key)} />
          </div>
        ))}

        {/* Channel */}
        <div className="border-border/70 border-t py-3.5">
          <div className="text-primary mb-2.5 text-xs font-extrabold">
            수신 채널
          </div>
          <div className="flex gap-2">
            {(
              [
                ["app", "앱 푸시"],
                ["email", "이메일"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setChannel(val)}
                className={cn(
                  "rounded-[9px] border px-3.5 py-2 text-xs font-bold transition-colors",
                  channel === val
                    ? "border-point-border bg-point-soft text-point-hover"
                    : "border-border text-muted-foreground hover:border-point-border bg-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification feed */}
      {notifs.length === 0 ? (
        <div className="text-muted-foreground px-5 py-14 text-center">
          <div className="mb-2 text-3xl">☼</div>
          <div className="text-sm font-bold">새로운 알림이 없습니다.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifs.map(({ id, icon: Icon, title, time, unread }) => (
            <button
              key={id}
              type="button"
              className={cn(
                "border-border bg-card hover:border-point-border flex w-full items-center gap-3 rounded-[14px] border p-4 text-left transition-colors",
                unread && "bg-point-soft/30",
              )}
            >
              <span className="bg-point-soft text-point-hover flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-foreground text-sm leading-snug font-bold">
                  {title}
                </div>
                <div className="text-muted-foreground mt-1 font-mono text-[12px]">
                  {time}
                </div>
              </div>
              {unread && (
                <span className="bg-point size-2 shrink-0 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
