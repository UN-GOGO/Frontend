"use client";

import { useEffect, useState } from "react";

import { Conversation } from "./conversation";
import { QuizPage } from "./quiz-page";
import { Result } from "./result";
import { buildProfile, EMPTY_PROFILE } from "@/lib/compass/flows";
import { saveCompassProfile } from "@/lib/compass/profile-store";
import { getRecommendation } from "@/lib/compass/recommend";
import { saveCompassResult } from "@/lib/compass/save";
import type {
  Answer,
  CompassTrack,
  ProfileSummary,
  RecommendResponse,
} from "@/lib/compass/types";
import { createClient } from "@/lib/supabase/client";

// 나침반 흐름: 정보입력(대화형) → 진단 퀴즈(스텝 카드형) → 결과
type Phase = "conversation" | "quiz" | "result";

export function CompassFlow() {
  const [phase, setPhase] = useState<Phase>("conversation");
  // 정보입력(대화) 단계에서 확정한 값 — 퀴즈 이후 추천 요청에 함께 쓴다
  const [profileInput, setProfileInput] =
    useState<ProfileSummary>(EMPTY_PROFILE);
  const [track, setTrack] = useState<CompassTrack | null>(null);
  const [saveToMypage, setSaveToMypage] = useState(false);

  useEffect(() => {
    const restorePendingProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const pending = sessionStorage.getItem("iogo_pending_compass_profile");
      if (pending) {
        try {
          const { profile, track } = JSON.parse(pending) as {
            profile: ProfileSummary;
            track: CompassTrack;
          };
          if (profile && track) {
            // 로그인 상태이므로, 마이페이지 프로필로 자동 업로드
            await saveCompassProfile(profile);

            // 상태 설정 후 퀴즈로 바로 진입
            setProfileInput(profile);
            setTrack(track);
            setSaveToMypage(true);
            setPhase("quiz");
          }
        } catch (e) {
          console.error("Failed to parse pending compass profile", e);
        } finally {
          sessionStorage.removeItem("iogo_pending_compass_profile");
        }
      }
    };
    restorePendingProfile();
  }, []);

  const [summary, setSummary] = useState<ProfileSummary>(EMPTY_PROFILE);
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [isAI, setIsAI] = useState(false);
  // AI 추천이 규칙기반으로 떨어진 이유가 응답 지연(타임아웃)인지 — 화면에서
  // "오프라인 폴백"과 다르게 안내하기 위함(백엔드는 살아있을 가능성이 높음).
  const [timedOut, setTimedOut] = useState(false);
  const [loading, setLoading] = useState(false);

  // 정보입력(대화) 완료 → 퀴즈 화면으로 전환
  const startQuiz = (
    profile: ProfileSummary,
    tk: CompassTrack,
    save: boolean,
  ) => {
    setProfileInput(profile);
    setTrack(tk);
    setSaveToMypage(save);
    setPhase("quiz");
  };

  // 퀴즈 완료 → 추천 요청 후 결과 화면
  const finish = async (answers: Answer[]) => {
    if (!track) return;
    const profile = buildProfile(profileInput, answers, track);
    // buildProfile이 퀴즈 답에서 도출한 관심 분야·진출 경로까지 포함된 프로필.
    // 원본 profileInput을 그대로 쓰면 파생값이 유실되어 공고·인사이트가 재료를 잃는다.
    setSummary(profile.summary);
    setLoading(true);
    setPhase("result");
    const {
      data,
      isAI,
      timedOut: didTimeOut,
    } = await getRecommendation(profile.text, answers, track);
    setData(data);
    setIsAI(isAI);
    setTimedOut(!!didTimeOut);
    setLoading(false);

    // 저장은 사용자가 동의(마이페이지 저장)했을 때만. 게스트/미동의는 저장 안 함.
    // 화면 흐름은 막지 않는다(베스트 에포트).
    // navigator_results 한 행에 입력(profile_input)+결과를 함께 upsert(user_id당 1행).
    // users(개인화 프로필)는 여기서 건드리지 않는다 — 친구 대신 진단하는 경우를 위해,
    // users 동기화는 프로필 수정 페이지의 명시 저장에서만 수행한다.
    if (saveToMypage) {
      void saveCompassResult({
        profileInput: profile.summary,
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
    setTimedOut(false);
    setLoading(false);
    setSummary(EMPTY_PROFILE);
    setProfileInput(EMPTY_PROFILE);
    setTrack(null);
    setSaveToMypage(false);
    setPhase("conversation");
  };

  return (
    <div className="w-full">
      {phase === "conversation" && <Conversation onFinish={startQuiz} />}
      {phase === "quiz" && track && (
        <QuizPage track={track} onFinish={finish} onExit={reset} />
      )}
      {phase === "result" && (
        <Result
          summary={summary}
          data={data}
          isAI={isAI}
          timedOut={timedOut}
          loading={loading}
          onRetry={reset}
        />
      )}
    </div>
  );
}
