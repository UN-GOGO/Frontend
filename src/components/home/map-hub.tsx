"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import {
  Briefcase,
  Compass,
  MessageCircle,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

type Hub = {
  href: string;
  label: string;
  badgeText: string;
  fullTitle: string;
  descLine1: string;
  descLine2: string;
  icon: LucideIcon;
  stepNumber: number;
  top: number; // percentage (desktop)
  left: number; // percentage (desktop)
  cardBg: string;
  cardText: string;
  stepBg: string;
  stepText: string;
  iconBg: string; // for desktop Lucide ring
  imageSrc: string; // for mobile SVG
  imageWidth: number;
  imageHeight: number;
  imageTop: string;
  imageLeft: string;
};

// Exact data mapping & color specs per SVG 998x320 vector source
const HUBS: Hub[] = [
  {
    href: "/compass",
    label: "나침반",
    badgeText: "STEP 1",
    fullTitle: "나침반 (적성/진로 테스트)",
    descLine1: "어디로 가야 할지 고민된다면 여기부터 시작해!",
    descLine2: "나침반이 너에게 맞는 진로 방향을 알려줄 거야.",
    icon: Compass,
    stepNumber: 1,
    top: 40,
    left: 44.5,
    cardBg: "bg-[#007FFF]",
    cardText: "text-white",
    stepBg: "bg-white",
    stepText: "text-[#007FFF]",
    iconBg: "from-[#3399FF] to-[#0066CC] border-white/50 text-white shadow-xl",
    imageSrc: "/main_icon01.svg",
    imageWidth: 157,
    imageHeight: 152,
    imageTop: "-37px",
    imageLeft: "72px",
  },
  {
    href: "/jobs",
    label: "공고",
    badgeText: "STEP 2",
    fullTitle: "공고 (맞춤형 공고 탐색)",
    descLine1: "네 방향을 찾았다면, 이제 실제 기회를 만나볼 차례야!",
    descLine2: "너와 잘 맞는 국제기구 공고를 함께 찾아보자.",
    icon: Briefcase,
    stepNumber: 2,
    top: 52,
    left: 16.5,
    cardBg: "bg-[#0C5CBD]",
    cardText: "text-white",
    stepBg: "bg-white",
    stepText: "text-[#007FFF]",
    iconBg: "from-[#1772E2] to-[#08418A] border-white/40 text-white shadow-xl",
    imageSrc: "/main_icon02.svg",
    imageWidth: 147,
    imageHeight: 166,
    imageTop: "-37px",
    imageLeft: "84px",
  },
  {
    href: "/insight",
    label: "인사이트",
    badgeText: "STEP 3",
    fullTitle: "인사이트 (맞춤형 기사 추천)",
    descLine1: "국제기구가 요즘 어떤 일을 하는지 궁금하지 않아?",
    descLine2: "너의 관심 분야에 맞는 기사와 소식을 모아줄게.",
    icon: Newspaper,
    stepNumber: 3,
    top: 36,
    left: 78,
    cardBg: "bg-[#42C0FF]",
    cardText: "text-white",
    stepBg: "bg-white",
    stepText: "text-[#007FFF]",
    iconBg: "from-[#7DD3FC] to-[#0284C7] border-white/60 text-white shadow-xl",
    imageSrc: "/main_icon03.svg",
    imageWidth: 147,
    imageHeight: 156,
    imageTop: "-27px",
    imageLeft: "74px",
  },
  {
    href: "/chat",
    label: "챗봇",
    badgeText: "STEP 4",
    fullTitle: "챗봇 (Q&A 및 실시간 질문)",
    descLine1: "막히는 부분이 있다면 언제든 물어봐!",
    descLine2: "나랑이가 국제기구 진출에 필요한 궁금증을 함께 풀어줄게.",
    icon: MessageCircle,
    stepNumber: 4,
    top: 26,
    left: 32.5,
    cardBg: "bg-[#D3EEFD]",
    cardText: "text-[#0C5CBD]",
    stepBg: "bg-white",
    stepText: "text-[#0C5CBD]",
    iconBg: "from-white to-[#BAE6FD] border-white/90 text-[#0C5CBD] shadow-md",
    imageSrc: "/main_icon04.svg",
    imageWidth: 160,
    imageHeight: 144,
    imageTop: "-17px",
    imageLeft: "81px",
  },
];

export function MapHub() {
  const router = useRouter();

  // Embla Carousel hook for smooth mobile card sliding
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    containScroll: false,
  });
  const [activeStep, setActiveStep] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setActiveStep(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

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
      {/* 1. Desktop View (Visible on lg and above)                                */}
      {/* ========================================================================= */}
      <div className="relative hidden w-full flex-grow flex-col overflow-hidden bg-[linear-gradient(to_top,#CBE9FF_0%,#F6FBFC_61%)] lg:flex">
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
      {/* 2. Mobile & Tablet View (Up to 1024px)                                    */}
      {/* ========================================================================= */}
      <div className="no-scrollbar relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-b from-[#F6FBFC] to-[#CBE9FF] lg:hidden">
        {/* ======================= */}
        {/* 모바일 전용 Hero (0 ~ 639px) */}
        {/* ======================= */}
        <div className="sm:hidden">
          {/* Welcome Text Section */}
          <div className="relative z-10 pt-[60px] pl-[25px] text-left select-none">
            <h1 className="text-[28px] leading-[1.3] font-bold tracking-[-0.02em] text-[#123C91]">
              안녕하세요!
              <br />
              여러분의 국제기구 진출을
              <br />
              돕는 든든한 길잡이
            </h1>
            <div className="mt-2 flex items-center">
              <span className="inline-flex items-center justify-center rounded-[10px] bg-[#0088FF] px-[10px] py-[4px] text-[28px] font-bold tracking-[-0.02em] text-white">
                나랑
              </span>
              <span className="ml-[10px] text-[28px] font-bold tracking-[-0.02em] text-[#123C91]">
                이에요
              </span>
            </div>
          </div>

          {/* 3D Mascot Character (Exact 420x384 spec) */}
          <div className="pointer-events-none relative z-0 mx-auto mt-[10px] w-full pb-[90%]">
            <Image
              src="/mascot_default.png"
              alt="나랑이"
              fill
              priority
              sizes="420px"
              className="absolute -left-[23px] origin-top scale-[1.1] transform-gpu object-cover"
            />
            {/* 삭제되었던 모바일 픽셀 퍼펙트 그라데이션 장식 완벽 복구 */}
            <div className="pointer-events-none absolute bottom-0 left-0 z-0 h-[100px] w-full bg-[linear-gradient(180deg,rgba(253,253,253,0)_0%,#f0f0f0_24.04%,#f0f0f0_100%)]" />
          </div>
        </div>

        {/* ============================== */}
        {/* 태블릿 전용 Hero (640px ~ 1023px) */}
        {/* ============================== */}
        <div className="relative z-10 hidden w-full flex-row items-center justify-between px-[25px] pt-[100px] sm:mx-auto sm:flex sm:max-w-4xl lg:hidden">
          {/* Welcome Text Section */}
          <div className="flex w-1/2 flex-col text-left select-none">
            <h1 className="text-3xl leading-[1.3] font-bold tracking-[-0.02em] text-[#123C91] sm:text-2xl">
              안녕하세요!
              <br />
              여러분의 국제기구 진출을
              <br />
              돕는 든든한 길잡이
            </h1>
            <div className="mt-2 flex items-center">
              <span className="inline-flex items-center justify-center rounded-[10px] bg-[#0088FF] px-[10px] py-[4px] text-3xl font-bold tracking-[-0.02em] text-white sm:text-2xl">
                나랑
              </span>
              <span className="ml-[10px] text-3xl font-bold tracking-[-0.02em] text-[#123C91] sm:text-2xl">
                이에요
              </span>
            </div>
          </div>

          {/* 3D Mascot Character */}
          <div className="pointer-events-none relative z-0 w-1/2 max-w-full pb-[300px]">
            <Image
              src="/mascot_default.png"
              alt="나랑이"
              fill
              priority
              sizes="360px"
              className="absolute right-0 object-contain"
            />
          </div>
        </div>

        {/* Embla Carousel Viewport */}
        {/* 모바일은 -mt-[50px]로 바짝 올리고 그라데이션 노출, 태블릿은 정상 마진에 투명 배경 */}
        <div className="relative z-20 -mt-[50px] w-full bg-[linear-gradient(180deg,rgba(253,253,253,0)_0%,#f0f0f0_24.04%,#f0f0f0_100%)] sm:mt-0 sm:bg-none">
          <div
            className="w-full cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
            ref={emblaRef}
          >
            {/* 아이콘이 위로 튀어나오므로 모바일/태블릿 모두 pt-[50px]를 주어 클리핑 방지 */}
            <div className="flex items-stretch gap-4 pt-[50px] pr-12 pb-8 pl-6">
              {HUBS.map((hub) => {
                return (
                  <div
                    key={hub.href}
                    className="min-w-0 flex-[0_0_241px] shrink-0"
                  >
                    <Link
                      href={hub.href}
                      className={`relative flex h-[283px] w-[241px] flex-col items-start rounded-[20px] px-[18px] pt-[129px] pb-[73px] shadow-[0_12px_28px_rgba(18,60,145,0.15)] ${hub.cardBg} transition-transform active:scale-98`}
                    >
                      {/* 3D SVG Image (Absolute Positioned via Figma Spec) */}
                      <Image
                        src={hub.imageSrc}
                        alt={hub.label}
                        width={hub.imageWidth}
                        height={hub.imageHeight}
                        className="pointer-events-none absolute z-10 m-0"
                        style={{ top: hub.imageTop, left: hub.imageLeft }}
                        priority
                      />

                      {/* Card Content Container */}
                      <div className="relative z-20 flex w-full flex-col items-start gap-[9px]">
                        {/* STEP Badge */}
                        <div
                          className={`flex items-center justify-center rounded-[10px] px-[10px] py-[4px] text-center ${hub.stepBg} ${hub.stepText}`}
                        >
                          <span className="text-[14px] leading-none font-bold tracking-[-0.02em]">
                            {hub.badgeText}
                          </span>
                        </div>

                        {/* Full Title */}
                        <div
                          className={`w-full text-[16px] font-semibold tracking-[-0.02em] ${hub.cardText} leading-snug`}
                        >
                          {hub.fullTitle}
                        </div>

                        {/* Description Lines */}
                        <div
                          className={`w-full text-[10px] font-semibold tracking-[-0.02em] ${hub.cardText} leading-[140%] break-keep`}
                        >
                          {hub.descLine1}
                          <br />
                          {hub.descLine2}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
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
        <div className="text-white">{hub.descLine1}</div>
        <div className="mt-0.5 text-[11px] font-normal text-white/70">
          {hub.descLine2}
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
