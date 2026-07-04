import { MapHub } from "@/components/home/map-hub";
import { OnboardingPopup } from "@/components/onboarding/onboarding-popup";

export const metadata = {
  title: "홈 — I-OGO",
};

export default function HomePage() {
  return (
    <>
      <MapHub />
      <OnboardingPopup />
    </>
  );
}
