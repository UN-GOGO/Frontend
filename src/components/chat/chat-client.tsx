"use client";

import { ArrowRight, ArrowUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ConnBadge, type ConnState } from "@/components/common/conn-badge";
import { sendChat, type ChatResponse } from "@/lib/api/iogo";
import { getUserId } from "@/lib/api/user";

type Msg = {
  role: "user" | "bot";
  text: string;
  sources?: ChatResponse["sources"];
};

const copy = {
  botName: "I-OGO 취준봇",
  botTag: "실시간 공공데이터",
  sub: "국제기구 공고 탐색부터 지원 준비까지 도와드려요.",
  aiBadge: "AI 생성",
  emptyTitle: "안녕하세요, I-OGO 취준봇이에요.",
  emptyDesc:
    "전공·언어·스킬에 맞는 국제기구 공고를 찾아 적합도와 함께 정리해 드려요. 아래에서 골라보거나 편하게 물어보세요.",
  suggestLabel: "이렇게 물어보세요",
  placeholder: "예: 내 스펙으로 지원 가능한 데이터 공고 찾아줘",
  inputHint: "외교부 공공데이터 기반 · 매일 09:00 KST 갱신",
  sourcesLabel: "참고한 자료",
} as const;

const SUGGESTIONS = [
  "환경 관련 UN 인턴십 알려줘",
  "내 스펙으로 지원 가능한 공고",
  "마감 임박한 데이터 분석 공고",
  "불어가 필요 없는 공고만",
] as const;

const AVATAR_GRADIENT = "linear-gradient(135deg, var(--point), var(--primary))";

export function ChatClient({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [state, setState] = useState<ConnState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const userIdRef = useRef("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserId().then((id) => {
      userIdRef.current = id;
      setState("ok"); // 실제 연결 여부는 첫 전송에서 확정
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, pending]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || pending) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text }]);
    setPending(true);
    try {
      const res = await sendChat(text, userIdRef.current, sessionId);
      setSessionId(res.session_id);
      setMsgs((m) => [
        ...m,
        { role: "bot", text: res.reply, sources: res.sources },
      ]);
      setState("ok");
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setState("error");
      setMsgs((m) => [...m, { role: "bot", text: "(연결 실패)" }]);
    } finally {
      setPending(false);
    }
  };

  const isEmpty = msgs.length === 0;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col px-6">
      {/* ── Chatbot identity header (상단 고정) ── */}
      <div className="border-border bg-background sticky top-0 z-20 mb-5 flex items-center gap-3 border-b pt-7 pb-4">
        <div
          className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: AVATAR_GRADIENT }}
        >
          <Sparkles className="size-[22px]" />
          <span className="border-background absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-[3px] bg-emerald-500" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground text-lg font-extrabold tracking-tight">
              {copy.botName}
            </span>
            <span className="bg-point-soft text-point-hover inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold">
              <span className="bg-point size-1.5 animate-[pol-blink_1.6s_infinite] rounded-full" />
              {copy.botTag}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-[13px]">{copy.sub}</p>
        </div>
        <div className="ml-auto hidden sm:block">
          <ConnBadge state={state} error={error} />
        </div>
      </div>

      {/* ── Conversation (페이지 전체 스크롤) ── */}
      <div className="flex flex-1 flex-col gap-4 pb-2">
        {isEmpty ? (
          <div className="flex flex-1 flex-col gap-5 py-1.5">
            {!isLoggedIn && (
              <div
                className="relative flex animate-[pol-up_0.35s_ease] flex-col items-center overflow-hidden rounded-[20px] px-6 py-7 text-center"
                style={{ background: "var(--primary)" }}
              >
                <span
                  className="pointer-events-none absolute -top-11 -right-8 size-[150px] rounded-full blur-[9px]"
                  style={{ background: "rgba(104,190,253,0.25)" }}
                />
                <span
                  className="relative mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    background: "rgba(104,190,253,0.22)",
                    color: "#D7EDFB",
                  }}
                >
                  <span className="bg-point size-1.5 animate-[pol-blink_1.6s_infinite] rounded-full" />
                  외교부 공공데이터 기반 · SDGs 연계
                </span>
                <h2 className="relative text-[20px] leading-tight font-extrabold tracking-tight whitespace-pre-line text-white">
                  전 세계 공고에서 나에게 맞는 길을 찾다
                </h2>
                <p className="relative mt-2.5 max-w-[600px] text-[12.5px] leading-relaxed text-[#b9c2da]">
                  AI가 외교부 공공데이터를 매일 분석해, 당신의 전공·언어·스킬에
                  맞는 국제기구 공고를 골라 정리합니다.
                </p>
                <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <Link
                    href="/login"
                    className="bg-point hover:bg-point-hover rounded-[10px] px-5 py-2.5 text-[13px] font-extrabold text-white transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-[10px] border-[1.5px] border-white/30 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:border-white"
                  >
                    회원가입
                  </Link>
                </div>
              </div>
            )}

            <AiBubble>
              <p className="text-foreground text-[15px] font-bold">
                {copy.emptyTitle}
              </p>
              <p className="text-muted-foreground mt-1.5 text-[13px] leading-relaxed">
                {copy.emptyDesc}
              </p>
            </AiBubble>

            <div>
              <p className="text-muted-foreground mb-2.5 ml-0.5 text-[11px] font-extrabold tracking-wide">
                {copy.suggestLabel}
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={pending}
                    className="border-border bg-card text-primary hover:border-point hover:bg-point-soft hover:text-point-hover group flex items-center gap-3 rounded-xl border p-3.5 text-left text-[13.5px] font-semibold transition-colors disabled:opacity-50"
                  >
                    <span className="bg-point-soft text-point flex size-[30px] shrink-0 items-center justify-center rounded-[9px]">
                      <Sparkles className="size-3.5" />
                    </span>
                    <span className="flex-1 leading-snug">{s}</span>
                    <ArrowRight className="group-hover:text-point size-4 shrink-0 text-slate-300 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div
                  key={i}
                  className="bg-primary max-w-[78%] animate-[pol-up_0.3s_ease] self-end rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed text-white"
                >
                  {m.text}
                </div>
              ) : (
                <AiBubble key={i}>
                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {m.text}
                  </p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="border-border mt-3 border-t border-dashed pt-3">
                      <p className="text-muted-foreground mb-2 text-[11px] font-extrabold tracking-wide">
                        {copy.sourcesLabel} · {m.sources.length}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((s, si) => (
                          <span
                            key={si}
                            className="bg-secondary text-secondary-foreground inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                          >
                            <span className="bg-point size-1.5 shrink-0 rounded-full" />
                            <span className="truncate">
                              {s.title ?? s.category ?? s.type}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </AiBubble>
              ),
            )}

            {pending && (
              <div className="border-point-border bg-card flex items-center gap-2 self-start rounded-2xl rounded-bl-sm border-[1.5px] px-4 py-3.5">
                {[0, 0.2, 0.4].map((d) => (
                  <span
                    key={d}
                    className="bg-point size-[7px] rounded-full"
                    style={{ animation: `pol-blink 1s infinite ${d}s` }}
                  />
                ))}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar (하단 고정) ── */}
      <div className="from-background sticky bottom-0 z-20 bg-gradient-to-t to-transparent pt-3.5 pb-5">
        <div className="border-border bg-card focus-within:border-point flex items-center gap-2 rounded-2xl border-[1.5px] py-2 pr-2 pl-3.5 shadow-[0_6px_20px_rgba(31,58,138,0.06)] transition-colors">
          <Sparkles className="text-point size-4 shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder={copy.placeholder}
            className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 border-none bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={pending || !input.trim()}
            aria-label="전송"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white transition-[filter] hover:brightness-110 disabled:opacity-40"
            style={{ background: AVATAR_GRADIENT }}
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
        <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5 font-mono text-[10px]">
          <span className="bg-point size-1.5 animate-[pol-blink_1.6s_infinite] rounded-full" />
          {copy.inputHint}
        </p>
      </div>
    </div>
  );
}

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[94%] animate-[pol-up_0.35s_ease] self-start">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="bg-point flex size-5 items-center justify-center rounded-md text-white">
          <Sparkles className="size-3" />
        </span>
        <span className="text-point text-[11px] font-extrabold tracking-wide">
          {copy.aiBadge}
        </span>
      </div>
      <div className="border-point-border bg-card rounded-2xl rounded-tl-sm border-[1.5px] p-4">
        {children}
      </div>
    </div>
  );
}
