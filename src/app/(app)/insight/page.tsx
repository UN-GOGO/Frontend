import { ScreenPlaceholder } from "@/components/layout/screen-placeholder";

export const metadata = {
  title: "인사이트 — Polaris",
};

export default function InsightPage() {
  return (
    <ScreenPlaceholder
      copy={{
        title: "인사이트",
        subtitle: "내 관심사에 맞춘 국제 뉴스와 트렌드를 한곳에서 확인하세요.",
      }}
    />
  );
}
