"use client";

import { useState } from "react";

import { ProfileIntro } from "./profile-intro";
import { Quiz } from "./quiz";
import { Result } from "./result";
import { buildProfile, EMPTY_PROFILE } from "@/lib/navigator/questions";
import { getRecommendation } from "@/lib/navigator/recommend";
import { saveNavigatorResult } from "@/lib/navigator/save";
import type {
  Answer,
  ProfileSummary,
  RecommendResponse,
} from "@/lib/navigator/types";

type Phase = "intro" | "quiz" | "result";

export function CompassFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [summary, setSummary] = useState<ProfileSummary>(EMPTY_PROFILE);
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [isAI, setIsAI] = useState(false);
  const [loading, setLoading] = useState(false);

  const start = (s: ProfileSummary) => {
    setSummary(s);
    setPhase("quiz");
  };

  const finish = async (answers: Answer[]) => {
    const profile = buildProfile(summary, answers);
    setLoading(true);
    setPhase("result");
    const { data, isAI } = await getRecommendation(profile.text, answers);
    setData(data);
    setIsAI(isAI);
    setLoading(false);

    // 추천 결과를 Supabase에 저장(로그인 상태면). 화면 흐름은 막지 않는다.
    void saveNavigatorResult({
      profileInput: summary,
      profileText: profile.text,
      answers,
      data,
      isAI,
    });
  };

  const reset = () => {
    setData(null);
    setIsAI(false);
    setLoading(false);
    setSummary(EMPTY_PROFILE);
    setPhase("intro");
  };

  return (
    <div className="w-full max-w-110">
      {phase === "intro" && <ProfileIntro onStart={start} />}
      {phase === "quiz" && (
        <Quiz onFinish={finish} onExit={() => setPhase("intro")} />
      )}
      {phase === "result" && (
        <Result
          summary={summary}
          data={data}
          isAI={isAI}
          loading={loading}
          onRetry={reset}
        />
      )}
    </div>
  );
}
