"use client";

import { useState } from "react";

import { Conversation } from "./conversation";
import { Result } from "./result";
import { buildProfile, EMPTY_PROFILE } from "@/lib/compass/flows";
import { getRecommendation } from "@/lib/compass/recommend";
import { saveCompassResult } from "@/lib/compass/save";
import type {
  Answer,
  CompassTrack,
  ProfileSummary,
  RecommendResponse,
} from "@/lib/compass/types";

type Phase = "conversation" | "result";

export function CompassFlow() {
  const [phase, setPhase] = useState<Phase>("conversation");
  const [summary, setSummary] = useState<ProfileSummary>(EMPTY_PROFILE);
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [isAI, setIsAI] = useState(false);
  const [loading, setLoading] = useState(false);

  const finish = async (
    profileInput: ProfileSummary,
    answers: Answer[],
    track: CompassTrack,
    saveToMypage: boolean,
  ) => {
    const profile = buildProfile(profileInput, answers, track);
    setSummary(profileInput);
    setLoading(true);
    setPhase("result");
    const { data, isAI } = await getRecommendation(
      profile.text,
      answers,
      track,
    );
    setData(data);
    setIsAI(isAI);
    setLoading(false);

    // 저장은 사용자가 동의(마이페이지 저장)했을 때만. 게스트/미동의는 저장 안 함.
    // 화면 흐름은 막지 않는다(베스트 에포트).
    // navigator_results 한 행에 입력(profile_input)+결과를 함께 upsert(user_id당 1행).
    // users(개인화 프로필)는 여기서 건드리지 않는다 — 친구 대신 진단하는 경우를 위해,
    // users 동기화는 프로필 수정 페이지의 명시 저장에서만 수행한다.
    if (saveToMypage) {
      void saveCompassResult({
        profileInput,
        profileText: profile.text,
        answers,
        data,
        isAI,
      });
    }
  };

  const reset = () => {
    setData(null);
    setIsAI(false);
    setLoading(false);
    setSummary(EMPTY_PROFILE);
    setPhase("conversation");
  };

  return (
    <div className="w-full">
      {phase === "conversation" && (
        <Conversation onFinish={finish} onExit={reset} />
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
