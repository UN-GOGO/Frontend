"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Compass,
  MessageCircle,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

type Hub = {
  href: string;
  label: string;
  descTitle: string;
  descDetail: string;
  icon: LucideIcon;
  top: number; // percentage
  left: number; // percentage
  // Card customization on mobile
  cardBg: string;
  cardText: string;
  stepBg: string;
  stepText: string;
};

const HUBS: Hub[] = [
  {
    href: "/jobs",
    label: "공고",
    descTitle: "네 방향을 찾았다면, 이제 실제 기회를 만나볼 차례야!",
    descDetail: "너와 잘 맞는 국제기구 공고를 함께 찾아보자.",
    icon: Briefcase,
    top: 52,
    left: 16.5,
    cardBg: "bg-[#0B2447]",
    cardText: "text-white",
    stepBg: "bg-white",
    stepText: "text-[#0B2447]",
  },
  {
    href: "/chat",
    label: "챗봇",
    descTitle: "막히는 부분이 있다면 언제든 물어봐!",
    descDetail: "나랑이가 국제기구 진출에 필요한 궁금증을 함께 풀어줄게.",
    top: 26,
    left: 32.5,
    icon: MessageCircle,
    cardBg: "bg-[#E0F2FE]",
    cardText: "text-[#0B2447]",
    stepBg: "bg-[#0B2447]",
    stepText: "text-white",
  },
  {
    href: "/compass",
    label: "나침반",
    descTitle: "어디로 가야 할지 고민된다면 여기부터 시작해!",
    descDetail: "나침반이 너에게 맞는 진로 방향을 알려줄 거야.",
    icon: Compass,
    top: 40,
    left: 44.5,
    cardBg: "bg-[#117dff]",
    cardText: "text-white",
    stepBg: "bg-white",
    stepText: "text-[#117dff]",
  },
  {
    href: "/insight",
    label: "인사이트",
    descTitle: "국제기구가 요즘 어떤 일을 하는지 궁금하지 않아?",
    descDetail: "너의 관심 분야에 맞는 기사와 소식을 모아줄게.",
    icon: Newspaper,
    top: 36,
    left: 78,
    cardBg: "bg-[#38BDF8]",
    cardText: "text-white",
    stepBg: "bg-white",
    stepText: "text-[#38BDF8]",
  },
];

export function MapHub() {
  const router = useRouter();

  // Prefetch pages for instant transitions
  useEffect(() => {
    HUBS.forEach((hub) => router.prefetch(hub.href));
  }, [router]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `,
        }}
      />

      {/* ========================================================================= */}
      {/* 1. Desktop View (Visible on md and above)                                */}
      {/* ========================================================================= */}
      <div className="relative hidden w-full flex-grow flex-col overflow-hidden bg-[linear-gradient(to_top,#CBE9FF_0%,#F6FBFC_61%)] md:flex">
        {/* Dotted vector map background & blue overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/map_default.png"
            alt="World Map Background"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.35] mix-blend-multiply"
          />
          {/* Radial grid pattern mimicking dotted grids */}
          <div className="absolute inset-0 bg-[radial-gradient(#576CBC_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.12]" />
        </div>

        {/* 4 Interactive Pins */}
        <div className="absolute inset-0 z-10">
          {HUBS.map((hub, i) => (
            <MapPin key={hub.href} hub={hub} delay={i * 0.12} />
          ))}
        </div>

        {/* Narang welcome message & 3D character in bottom right */}
        <div className="pointer-events-none absolute right-0 bottom-0 z-20 flex max-w-[1050px] animate-[pol-up_0.5s_ease_both] items-center gap-6 select-none">
          {/* Welcome Text Box */}
          <div className="mb-6 flex flex-col text-right">
            <h1 className="text-[34px] leading-tight font-extrabold tracking-tight text-[#0B2447]">
              안녕하세요! 여러분의 국제기구 진출을 돕는
              <br />
              든든한 길잡이{" "}
              <span className="relative top-[-2px] mx-1 inline-block rounded-[10px] bg-[#117dff] px-2.5 py-0.5 text-[32px] font-extrabold text-white shadow-sm">
                나랑
              </span>{" "}
              이에요
            </h1>
            <p className="mt-3.5 text-[16px] leading-relaxed font-semibold text-[#64748B]">
              여러분에게 맞는 국제기구와 진로 방향을 찾을 수 있도록 세계 곳곳을
              함께 탐색해줄게요!
            </p>
          </div>
          {/* Mascot image */}
          <div className="relative h-[300px] w-[220px] shrink-0">
            <Image
              src="/map_right.png"
              alt="나랑이"
              fill
              priority
              sizes="300px"
              className="object-contain object-bottom drop-shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Mobile View (Visible on screens smaller than md)                      */}
      {/* ========================================================================= */}
      <div className="no-scrollbar relative flex w-full flex-grow flex-col overflow-y-auto bg-gradient-to-b from-[#E0F2FE] to-[#F0F9FF] px-6 py-6 pb-20 md:hidden">
        {/* Welcome Section */}
        <div className="mt-4 mb-6 flex w-full items-center gap-4 select-none">
          {/* Mascot */}
          <div className="relative size-[140px] shrink-0">
            <Image
              src="/mascot_default.png"
              alt="나랑이"
              fill
              priority
              sizes="140px"
              className="object-contain drop-shadow-lg"
            />
          </div>
          {/* Welcome Text */}
          <div className="flex flex-col">
            <h1 className="text-[20px] leading-snug font-extrabold tracking-tight text-[#0B2447]">
              안녕하세요!
              <br />
              여러분의 국제기구 진출을
              <br />
              돕는 든든한 길잡이
              <br />
              <span className="mt-1 inline-block rounded-[8px] bg-[#117dff] px-2 py-0.5 text-[18px] font-extrabold text-white shadow-sm">
                나랑
              </span>{" "}
              이에요
            </h1>
          </div>
        </div>

        {/* Card Carousel */}
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pt-2 pb-6">
          {HUBS.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <Link
                key={hub.href}
                href={hub.href}
                className={`flex aspect-[4/5] w-[285px] shrink-0 snap-center flex-col justify-between rounded-[28px] p-6 shadow-[0_8px_20px_rgba(0,0,0,0.06)] ${hub.cardBg} transition-transform active:scale-98`}
              >
                {/* 3D-like circular badge for icon */}
                <div className="relative flex size-20 items-center justify-center rounded-full border border-white/25 bg-white/20 shadow-lg backdrop-blur-md">
                  <Icon className="size-9 text-white" strokeWidth={2.2} />
                </div>

                {/* Info Text */}
                <div className="mt-4 flex flex-col">
                  <div
                    className={`mb-3 inline-block w-fit rounded-full px-3 py-1 text-[10.5px] font-extrabold shadow-sm ${hub.stepBg} ${hub.stepText}`}
                  >
                    STEP {i + 1}
                  </div>
                  <h3
                    className={`text-lg font-bold tracking-tight ${hub.cardText} mb-2`}
                  >
                    {hub.label} {i === 0 && "(적성/진로 테스트)"}
                    {i === 1 && "(맞춤형 공고 탐색)"}
                    {i === 2 && "(맞춤형 기사 추천)"}
                    {i === 3 && "(Q&A 및 실시간 질문)"}
                  </h3>
                  <p
                    className={`text-[12.5px] leading-relaxed font-medium opacity-90 ${hub.cardText}`}
                  >
                    {hub.descTitle}
                    <br />
                    {hub.descDetail}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

function MapPin({ hub, delay }: { hub: Hub; delay: number }) {
  const router = useRouter();
  const Icon = hub.icon;

  const handlePinClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    router.push(hub.href);
  };

  return (
    <Link
      href={hub.href}
      onClick={handlePinClick}
      aria-label={`${hub.label}(으)로 이동`}
      style={{
        top: `${hub.top}%`,
        left: `${hub.left}%`,
        animation: `pol-up 0.5s ease ${delay}s both`,
      }}
      className="group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center focus:outline-none"
    >
      {/* Speech bubble */}
      <div className="relative mb-3 rounded-2xl bg-[#19376D] px-4 py-2.5 text-center text-xs leading-relaxed font-semibold tracking-tight whitespace-nowrap text-white shadow-[0_8px_30px_rgb(25,55,109,0.2)] transition-all duration-300 group-hover:-translate-y-1">
        <div className="mb-1 text-[15px] font-extrabold text-[#38BDF8]">
          {hub.label}
        </div>
        <div className="text-white">{hub.descTitle}</div>
        <div className="mt-0.5 text-[11px] font-normal text-white/70">
          {hub.descDetail}
        </div>
        {/* Down Arrow */}
        <div className="absolute top-full left-1/2 -mt-[1px] h-0 w-0 -translate-x-1/2 border-t-[6px] border-r-[6px] border-l-[6px] border-t-[#19376D] border-r-transparent border-l-transparent" />
      </div>

      {/* Pin Circle with White Ring */}
      <button
        type="button"
        className="relative flex size-13 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-[#117dff] text-white shadow-[0_8px_20px_rgba(17,125,255,0.25)] transition-all duration-300 group-hover:scale-115 group-hover:bg-[#117dff] group-hover:shadow-[0_12px_28px_rgba(17,125,255,0.45)]"
      >
        {/* Pulse Ring */}
        <span
          className="absolute inset-0 -z-10 rounded-full bg-[#117dff]"
          style={{ animation: "pol-ping 2s ease-out infinite" }}
        />
        <Icon className="size-5.5 shrink-0" strokeWidth={2.4} />
      </button>
    </Link>
  );
}
