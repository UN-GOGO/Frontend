import {
  Briefcase,
  Compass,
  MessageCircle,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Hub = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Position over the banner, as % from top-left. */
  top: number;
  left: number;
  /** 라벨을 점 위/아래 어디에 붙일지 — 밀집 구역에서 겹침 방지 */
  labelBelow?: boolean;
};

const HUBS: Hub[] = [
  { href: "/compass", label: "나침반", icon: Compass, top: 58, left: 14 },
  {
    href: "/chat",
    label: "챗봇",
    icon: MessageCircle,
    top: 47,
    left: 45,
    labelBelow: true,
  },
  {
    href: "/jobs",
    label: "공고",
    icon: Briefcase,
    top: 28,
    left: 32,
    labelBelow: true,
  },
  { href: "/insight", label: "인사이트", icon: Newspaper, top: 34, left: 74 },
];

// 점들을 잇는 "항로" — dot 좌표(top/left %)에서 자동 생성해 항상 점을 따라간다.
// 좌→우(left 오름차순)로 이어 곡선 대시를 그린다. dot을 옮기면 선도 자동으로 맞춰짐.
function buildRoutes(hubs: Hub[]): string[] {
  const pts = [...hubs]
    .sort((a, b) => a.left - b.left)
    .map((h) => ({ x: h.left, y: h.top }));
  const CURVE = 0.28; // 클수록 더 둥글게(제어점을 세그먼트에 수직으로 밀어냄)
  const paths: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    // 세그먼트에 수직인 방향(위쪽으로 볼록)으로 제어점을 밀어낸다
    let nx = -dy / len;
    let ny = dx / len;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const cx = (a.x + b.x) / 2 + nx * len * CURVE;
    const cy = (a.y + b.y) / 2 + ny * len * CURVE;
    paths.push(`M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`);
  }
  return paths;
}

const ROUTES = buildRoutes(HUBS);

/** Home banner: world map + always-on menu labels, flight-path routes, mascot. */
export function MapHub() {
  return (
    <section className="mx-auto w-full max-w-[1120px] px-6 py-7">
      <div className="border-border relative aspect-[16/9] w-full overflow-hidden rounded-[20px] border shadow-[0_10px_30px_rgba(31,58,138,0.10)]">
        <Image
          src="/map_banner.jpg"
          alt="세계 지도"
          fill
          priority
          sizes="(max-width: 1120px) 100vw, 1120px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,58,138,0.35)] to-transparent" />

        {/* 항로 — 점선 곡선, 대시가 흐르는 애니메이션 */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {ROUTES.map((d, i) => (
            <path
              key={i}
              d={d}
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
          ))}
        </svg>

        {HUBS.map((hub, i) => (
          <MapDot key={hub.href} hub={hub} delay={i * 0.12} />
        ))}

        {/* 안내 마스코트 — 전신 노출 */}
        <Link
          href="/compass"
          aria-label="나침반 진단 시작"
          className="group absolute bottom-3 left-4 flex items-end gap-2"
        >
          <span className="relative block h-36 w-28 shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/mascot_default.png"
              alt="I-OGO 안내 캐릭터"
              fill
              sizes="112px"
              className="object-contain object-bottom drop-shadow-lg"
            />
          </span>
          <span className="bg-primary mb-6 rounded-lg px-2.5 py-1.5 text-[12px] font-bold whitespace-nowrap text-white shadow-lg">
            국제기구, 여기서 시작해요
          </span>
        </Link>
      </div>
    </section>
  );
}

function MapDot({ hub, delay }: { hub: Hub; delay: number }) {
  const { href, label, icon: Icon, top, left, labelBelow } = hub;
  return (
    <Link
      href={href}
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
      <span className="bg-point group-hover:bg-point-hover relative flex size-4 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white/90 transition-[transform] group-hover:scale-110" />

      {/* 상시 라벨 — hover 없이 항상 노출(모바일 포함) */}
      <span
        className={`bg-primary absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-bold whitespace-nowrap text-white shadow-lg transition-transform group-hover:scale-105 ${
          labelBelow ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]"
        }`}
      >
        <Icon className="size-3.5" strokeWidth={2.5} />
        {label}
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
