"use client";

import { ArrowUpRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { BookmarkButton } from "./bookmark-button";
import { getOpportunity, type Opportunity } from "@/lib/api/ungogo";
import { ddayChip, fitBadge, orgAbbrev } from "@/lib/opportunity";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "ok" | "error";

export function JobDetailClient({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Opportunity | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    getOpportunity(id, { signal: ctrl.signal })
      .then((data) => {
        setJob(data);
        setState("ok");
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setState("error");
      });
    return () => ctrl.abort();
  }, [id]);

  const fit = job?.score != null ? fitBadge(job.score) : null;
  const dday = ddayChip(job?.deadline);

  return (
    <div className="mx-auto w-full max-w-[760px] px-6 py-7">
      <Link
        href="/jobs"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
      >
        <ChevronLeft className="size-4" />
        공고 목록
      </Link>

      {state === "loading" && (
        <p className="text-muted-foreground text-sm">공고를 불러오는 중…</p>
      )}

      {state === "error" && (
        <div className="text-muted-foreground py-12 text-center">
          <p className="text-foreground text-[15px] font-bold">
            공고를 불러오지 못했어요
          </p>
          <p className="mt-1.5 text-sm">{error}</p>
        </div>
      )}

      {state === "ok" && job && (
        <article className="bg-card border-border rounded-2xl border p-6">
          {/* org + bookmark */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary flex size-12 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white">
                {orgAbbrev(job.organization)}
              </div>
              <div className="min-w-0">
                <div className="text-muted-foreground text-sm font-bold">
                  {job.organization}
                </div>
                {job.location && (
                  <div className="text-xs text-slate-400">{job.location}</div>
                )}
              </div>
            </div>
            <BookmarkButton id={job.id} iconClassName="size-6" />
          </div>

          {/* title */}
          <h1 className="text-foreground mt-4 text-xl leading-snug font-extrabold tracking-tight">
            {job.title}
          </h1>

          {/* tags */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {job.type && (
              <span className="bg-point-soft text-point-hover rounded-md px-2.5 py-1 text-[11px] font-bold">
                {job.type}
              </span>
            )}
            {fit && (
              <span
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums",
                  fit.cls,
                )}
              >
                {fit.pct}% 적합
              </span>
            )}
            {dday && (
              <span
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums",
                  dday.cls,
                )}
              >
                {dday.label}
              </span>
            )}
          </div>

          {/* deadline line */}
          {job.deadline && (
            <p className="text-muted-foreground mt-4 font-mono text-xs">
              마감 · {job.deadline}
            </p>
          )}

          {/* description */}
          {job.description && (
            <div className="border-border mt-5 border-t pt-5">
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-slate-600">
                {job.description}
              </p>
            </div>
          )}

          {/* apply */}
          <a
            href={job.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/85 mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors"
          >
            지원하러 가기
            <ArrowUpRight className="size-4" />
          </a>
        </article>
      )}
    </div>
  );
}
