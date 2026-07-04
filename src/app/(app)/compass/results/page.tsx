import { ResultDetail } from "@/components/compass/result-detail";

export const metadata = {
  title: "나침반 결과 — I-OGO",
};

// id 없이 진입 시 로그인 유저의 최신 나침반 결과를 보여준다.
export default function CompassLatestResultPage() {
  return <ResultDetail />;
}
