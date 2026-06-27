"use client";

import { useState } from "react";

import { ProfileIntro } from "./profile-intro";
import { Quiz } from "./quiz";
import { Result } from "./result";
import { buildProfile, EMPTY_PROFILE } from "@/lib/compass/questions";
import { getRecommendation } from "@/lib/compass/recommend";
import { saveCompassResult } from "@/lib/compass/save";
import type {
  Answer,
  ProfileSummary,
  RecommendResponse,
} from "@/lib/compass/types";

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
    void saveCompassResult({
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
    <div className="w-full">
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
