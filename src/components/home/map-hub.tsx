"use client";

import { useEffect, useState } from "react";
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
  /** hover 시 말풍선에 표시되는 메뉴 설명 */
  desc: string;
  icon: LucideIcon;
  /** Position over the banner, as % from top-left. */
  top: number;
  left: number;
  /** 라벨을 점 위/아래 어디에 붙일지 — 밀집 구역에서 겹침 방지 */
  labelBelow?: boolean;
};

const HUBS: Hub[] = [
  {
    href: "/compass",
    label: "나침반",
    desc: "적성 진단으로 나에게 맞는 기구 찾기",
    icon: Compass,
    top: 58,
    left: 15,
  },
  {
    href: "/jobs",
    label: "공고",
    desc: "국제기구 채용 공고 한눈에 모아보기",
    icon: Briefcase,
    top: 28,
    left: 30,
    labelBelow: true,
  },
  {
    href: "/chat",
    label: "챗봇",
    desc: "국제기구 궁금증, AI에게 바로 질문",
    icon: MessageCircle,
    top: 47,
    left: 45,
    labelBelow: true,
  },
  {
    href: "/insight",
    label: "인사이트",
    desc: "합격 수기와 커리어 정보 읽기",
    icon: Newspaper,
    top: 34,
    left: 74,
  },
];

// 점들을 잇는 "항로" — 사용자가 요청한 모양의 비행 궤적으로 수동 설정
function buildRoute(hubs: Hub[]): string {
  const pts = [...hubs]
    .sort((a, b) => a.left - b.left)
    .map((h) => ({ x: h.left, y: h.top }));
  if (pts.length < 2) return "";

  let d = `M${pts[0].x} ${pts[0].y}`;

  // 직접 그려주신 빨간 선 모양과 가장 비슷하게 나오도록 각 구간의
  // 제어점(Control Point) 좌표 (x, y)를 수동으로 지정합니다.
  const controlPoints = [
    { x: 13, y: 30 }, // 구간 1 (나침반 -> 공고): 왼쪽 위로 가파르게 솟아오름
    { x: 44, y: 30 }, // 구간 2 (공고 -> 챗봇): 위쪽으로 둥글게 솟아오름
    { x: 60, y: 70 }, // 구간 3 (챗봇 -> 인사이트): 태평양 아래로 깊게(U자 모양) 내려감
  ];

  for (let i = 0; i < controlPoints.length && i < pts.length - 1; i++) {
    const cp = controlPoints[i];
    d += ` Q${cp.x} ${cp.y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

const ROUTE = buildRoute(HUBS);

/** Home banner: world map + always-on menu labels, flight-path routes, mascot. */
export function MapHub() {
  const [zoomTarget, setZoomTarget] = useState<Hub | null>(null);
  const router = useRouter();

  // 지도의 점은 <a href>+router.push라 next/link 자동 prefetch를 못 받는다.
  // 사이드바/하단 네비(next/link 사용)는 이미 프리페치돼 즉시 전환되는데, 지도만
  // 클릭 시점에야 라우트를 로드해 그만큼 느려 보이고, 여기에 느린 개인화 백엔드
  // 응답까지 겹쳐 "연결 실패"로 보이는 경우가 잦았다. 마운트 시 미리 당겨온다.
  useEffect(() => {
    HUBS.forEach((hub) => router.prefetch(hub.href));
  }, [router]);

  const handleDotClick = (e: React.MouseEvent, hub: Hub) => {
    // 새 탭으로 열기(cmd/ctrl/shift+클릭, 가운데 버튼)는 브라우저 기본 동작을
    // 그대로 둔다 — 여기서 막으면 네이티브 "새 탭에서 열기"가 아예 안 먹는다.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setZoomTarget(hub);
    setTimeout(() => {
      router.push(hub.href);
    }, 600); // 0.6초(애니메이션 시간) 후 페이지 이동
  };

  return (
    <section className="relative w-full flex-1 overflow-hidden bg-gradient-to-t from-[#96ABD1] to-[#D7EDFB]">
      {/* 1. 확대되는 지도 이미지 배경 영역 */}
      <Image
        src="/map_default.png"
        alt="세계 지도"
        fill
        priority
        sizes="(max-width: 1120px) 100vw, 1120px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,58,138,0.35)] to-transparent" />

      {/* 2. 지도 UI 영역 (항로선 및 점) — 줌인 시 자연스럽게 페이드아웃 */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: zoomTarget ? 0 : 1,
          pointerEvents: zoomTarget ? "none" : "auto",
        }}
      >
        {/* 항로 — 점선 곡선, 대시가 흐르는 애니메이션 */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={ROUTE}
            fill="none"
            stroke="rgba(255,255,255,0.72)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="5 6"
            vectorEffect="non-scaling-stroke"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-22"
              dur="1.1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {HUBS.map((hub, i) => (
          <MapDot
            key={hub.href}
            hub={hub}
            delay={i * 0.12}
            onClick={(e) => handleDotClick(e, hub)}
          />
        ))}
      </div>
    </section>
  );
}

function MapDot({
  hub,
  delay,
  onClick,
}: {
  hub: Hub;
  delay: number;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { href, label, desc, icon: Icon, top, left, labelBelow } = hub;
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={`${label}(으)로 이동`}
      style={{
        top: `${top}%`,
        left: `${left}%`,
        animation: `pol-up 0.4s ease ${delay}s both`,
      }}
      className="group focus-visible:ring-point absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {/* Ping ring */}
      <span
        className="bg-point pointer-events-none absolute inset-0 rounded-full"
        style={{ animation: "pol-ping 2s ease-out infinite" }}
      />
      {/* Dot marker */}
      <span className="bg-point group-hover:bg-point-hover relative flex size-4 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white/90 transition-transform duration-200 group-hover:scale-125" />

      {/* 상시 라벨 — hover 없이 항상 노출(모바일 포함), hover 시 설명 말풍선으로 확장 */}
      <span
        className={`bg-primary absolute left-1/2 flex -translate-x-1/2 flex-col items-center rounded-lg px-2.5 py-1 text-[12px] font-bold whitespace-nowrap text-white shadow-lg transition-transform group-hover:scale-105 ${
          labelBelow ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Icon className="size-3.5" strokeWidth={2.5} />
          {label}
        </span>
        {/* hover 시에만 보이는 메뉴 설명 */}
        <span className="hidden pb-0.5 text-[11px] leading-snug font-medium text-white/85 group-hover:block">
          {desc}
        </span>
        {/* Arrow */}
        <span
          className={`bg-primary absolute left-1/2 size-2 -translate-x-1/2 rotate-45 rounded-[2px] ${
            labelBelow ? "bottom-full -mb-1" : "top-full -mt-1"
          }`}
        />
      </span>
    </Link>
  );
}
