/**
 * Shell-level copy for the global app layout (header / sidebar / bottom nav).
 * Korean-only. Per-screen copy lives with each screen.
 */
export const shellStrings = {
  tagline: "외교부 공공데이터 글로벌 커리어",
  // nav items — the three product pillars
  navCompass: "나침반",
  navOpportunities: "기회",
  navInsight: "인사이트",
  navChat: "챗봇",
  navNotif: "알림",
  navMy: "마이",
  // aria
  notifAria: "알림",
  mypageAria: "마이페이지",
  // live-data card
  liveData: "LIVE DATA",
  dataSource: "외교부 공공데이터 포털 실시간 연동",
} as const;

export type ShellStrings = typeof shellStrings;
