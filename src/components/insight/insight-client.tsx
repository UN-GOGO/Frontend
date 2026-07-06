"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ConnBadge, type ConnState } from "@/components/common/conn-badge";
import { InsightCard } from "@/components/insight/insight-card";
import { InsightSkeleton } from "@/components/insight/insight-card-skeleton";
import {
  getPersonalizedInsights,
  type PersonalizedInsights,
} from "@/lib/api/iogo";
import { getUserId } from "@/lib/api/user";

export function InsightClient() {
  const [state, setState] = useState<ConnState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [recs, setRecs] = useState<PersonalizedInsights | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const userId = await getUserId();
        const r = await getPersonalizedInsights(userId, {
          signal: ctrl.signal,
        });
        setRecs(r);
        setState("ok");
      } catch (e: unknown) {
        if (ctrl.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setState("error");
      }
    })();
    return () => ctrl.abort();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-foreground text-xl font-bold">인사이트</h1>
        <ConnBadge state={state} error={error} />
      </div>

      {state === "loading" && <InsightSkeleton />}

      {state !== "loading" && (
        <>
          {/* 추천 뉴스 */}
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-foreground text-sm font-bold">
                맞춤 인사이트
              </h2>
              {recs && !recs.has_compass && (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]">
                  일반 추천
                </span>
              )}
            </div>

            {recs && !recs.has_compass && (
              <div className="border-border bg-card mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[14px] border p-4">
                <p className="text-muted-foreground text-[13px]">
                  나침반 검사를 완료하면 관심사 기반으로 더 정확히 추천해
                  드려요.
                </p>
                <Link
                  href="/compass"
                  className="bg-primary hover:bg-point-hover shrink-0 rounded-[10px] px-3 py-2 text-xs font-bold text-white transition-colors"
                >
                  나침반 검사 하기
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {recs?.items?.map((a) => (
                <InsightCard key={a.id} article={a} />
              ))}
            </div>

            {recs && recs.items.length === 0 && (
              <p className="text-muted-foreground text-sm">
                추천할 뉴스가 없습니다.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
