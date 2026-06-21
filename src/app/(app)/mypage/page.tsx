import { ScreenPlaceholder } from "@/components/layout/screen-placeholder";

export const metadata = {
  title: "마이페이지 — Polaris",
};

export default function MyPage() {
  return (
    <ScreenPlaceholder
      copy={{
        title: "마이페이지",
        subtitle: "프로필·알림·설정과 내 활동을 한곳에서 관리합니다.",
      }}
    />
  );
}
