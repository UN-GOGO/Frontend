/**
 * Shell-level copy for the global app layout (header / sidebar / bottom nav).
 * Korean-only. Per-screen copy lives with each screen.
 */
export const shellStrings = {
  tagline: "외교부 공공데이터 글로벌 커리어",
  // nav items — the three product pillars
  navChat: "챗봇",
  navCompass: "나침반",
  navOpportunities: "공고",
  navInsight: "인사이트",
  navNotif: "알림",
  navMypage: "마이페이지",
  navLogin: "로그인",
  navSignup: "회원가입",
  // aria
  notifAria: "알림",
  mypageAria: "마이페이지",
  // live-data card
  liveData: "LIVE DATA",
  dataSource: "외교부 공공데이터 포털 실시간 연동",
} as const;

export type ShellStrings = typeof shellStrings;
