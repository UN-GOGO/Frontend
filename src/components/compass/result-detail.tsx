"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Result } from "./result";
import {
  getNavigatorResult,
  type NavigatorResultDetail,
} from "@/lib/compass/history";
import type { RecommendResponse } from "@/lib/compass/types";

export function ResultDetail({ id }: { id: string }) {
  const router = useRouter();
  const [result, setResult] = useState<NavigatorResultDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await getNavigatorResult(id);
      if (cancelled) return;
      setResult(r);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const data: RecommendResponse | null = result
    ? {
        needle_label: result.needleLabel ?? undefined,
        advice: result.advice ?? undefined,
        recommendations: result.recommendations,
        explore: result.explore,
      }
    : null;

  return (
    <div className="bg-background flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-8">
        <Link
          href="/mypage"
          className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
        >
          <ChevronLeft className="size-4" />
          마이페이지
        </Link>

        {!loading && !result ? (
          <div className="border-border text-muted-foreground rounded-[16px] border border-dashed p-10 text-center text-sm">
            결과를 찾을 수 없어요.
            <br />
            <Link
              href="/compass"
              className="text-point-hover mt-1 inline-block text-xs font-bold hover:underline"
            >
              나침반 진단하러 가기 →
            </Link>
          </div>
        ) : (
          <Result
            summary={
              result?.profileInput ?? {
                nick: "",
                major: "",
                degree: "",
                exp: "",
                english: "",
                second: "",
              }
            }
            data={data}
            isAI={result?.isAi ?? false}
            loading={loading}
            onRetry={() => router.push("/compass")}
          />
        )}
      </div>
    </div>
  );
}
