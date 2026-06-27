"use client";

import { useEffect, useState } from "react";

import { ConnBadge, type ConnState } from "./conn-badge";
import { InsightCard } from "./insight-card";
import {
  getRecommendations,
  getUserStats,
  type RecommendResult,
  type UserStats,
} from "@/lib/api/ungogo";
import { getUserId } from "@/lib/api/user";

export function InsightClient() {
  const [state, setState] = useState<ConnState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [recs, setRecs] = useState<RecommendResult | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const userId = await getUserId();
        const [r, s] = await Promise.all([
          getRecommendations(userId, { signal: ctrl.signal }),
          getUserStats(userId, { signal: ctrl.signal }),
        ]);
        setRecs(r);
        setStats(s);
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

      {/* 추천 뉴스 */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-foreground text-sm font-bold">추천 뉴스</h2>
          {recs?.type && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]">
              {recs.type}
            </span>
          )}
        </div>

        {recs &&
          recs.extracted_keywords &&
          recs.extracted_keywords.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {recs.extracted_keywords.map((k) => (
                <span
                  key={k}
                  className="bg-point-soft text-point-hover rounded-full px-2 py-0.5 text-[11px] font-semibold"
                >
                  #{k}
                </span>
              ))}
            </div>
          )}

        <div className="flex flex-col gap-3">
          {recs?.recommended_articles?.map((a) => (
            <InsightCard key={a.id} article={a} />
          ))}
        </div>

        {recs && recs.recommended_articles.length === 0 && (
          <p className="text-muted-foreground text-sm">
            추천할 뉴스가 없습니다.
          </p>
        )}
      </section>

      {/* 관심사 통계 */}
      <section>
        <h2 className="text-foreground mb-3 text-sm font-bold">관심사 통계</h2>

        {stats && !stats.has_data && (
          <p className="text-muted-foreground text-sm">{stats.message}</p>
        )}

        {stats && stats.has_data && (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground text-xs">
              총 활동 {stats.total_activities}건
            </p>

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold">
                관심 기구 비율
              </p>
              <div className="flex flex-col gap-2">
                {stats.organization_ratio.map((o) => (
                  <div key={o.name} className="text-sm">
                    <div className="mb-1 flex justify-between">
                      <span className="text-foreground">{o.name}</span>
                      <span className="text-muted-foreground">
                        {o.percentage}% ({o.count})
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${o.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {stats.top_keywords.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">
                  자주 찾은 키워드
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {stats.top_keywords.map((k) => (
                    <span
                      key={k.keyword}
                      className="border-border rounded-full border px-2 py-0.5 text-[11px]"
                    >
                      {k.keyword} · {k.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
