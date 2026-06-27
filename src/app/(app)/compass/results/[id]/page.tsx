import { ResultDetail } from "@/components/compass/result-detail";

export const metadata = {
  title: "나침반 결과 — I-OGO",
};

export default async function CompassResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResultDetail id={id} />;
}
