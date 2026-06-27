import { JobDetailClient } from "@/components/ungogo/job-detail-client";

export const metadata = {
  title: "공고 상세 — I-OGO",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailClient id={id} />;
}
