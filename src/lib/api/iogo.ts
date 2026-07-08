// un-gogo 백엔드(FastAPI) 엔드포인트 호출 레이어.
// 계약은 backend/app/schemas.py · routers/*.py 와 1:1로 맞춘다.

import { apiGet, apiPost, apiPut, type ApiInit } from "./client";

// ===== 공고 (opportunities) =====
export type Opportunity = {
  id: string;
  type: string;
  title: string;
  organization: string;
  description?: string | null;
  deadline?: string | null;
  location?: string | null;
  source_url: string;
  score?: number | null;
  match_score?: number | null;
  match_reasons?: string[];
  fetched_at?: string | null;
  /** 실제 공고 게시일 (requirements.posted_at 유래) */
  posted_at?: string | null;
};

export type OpportunityFilters = {
  type?: string;
  org?: string;
  deadline_after?: string;
  limit?: number;
};

const PUBLIC_DATA_VACANCY_PREFIX =
  "https://apis.data.go.kr/1262000/IntrlInsttVacancyInfoService/";

const PUBLIC_DATA_OPERATION_DETAIL_PATHS: Record<string, string> = {
  getInternshipVacancyInfoList: "internship/notice_view.jsp",
  getJpoVacancyInfoList: "jpo_ncre/jpo_ncre_notice_view.jsp",
  getUnvVacancyInfoList: "unv/notice_view.jsp",
  getInsttVacancyInfoList: "instt/notice_view.jsp",
};

export function normalizeOpportunitySourceUrl(sourceUrl: string): string {
  const brokenJpoUrl = "https://unrecruit.mofa.go.kr/new/jpo/notice_view.jsp";
  if (sourceUrl.startsWith(brokenJpoUrl)) {
    try {
      const url = new URL(sourceUrl);
      const seq = url.searchParams.get("seq");
      if (!seq) return sourceUrl;
      return `https://unrecruit.mofa.go.kr/new/jpo_ncre/jpo_ncre_notice_view.jsp?seq=${seq}`;
    } catch {
      return sourceUrl;
    }
  }

  if (!sourceUrl.startsWith(PUBLIC_DATA_VACANCY_PREFIX)) return sourceUrl;

  try {
    const url = new URL(sourceUrl);
    const operation = url.pathname.split("/").filter(Boolean).at(-1);
    const seq = url.searchParams.get("seq");
    const detailPath = operation
      ? PUBLIC_DATA_OPERATION_DETAIL_PATHS[operation]
      : undefined;

    if (!seq || !detailPath) return sourceUrl;
    return `https://unrecruit.mofa.go.kr/new/${detailPath}?seq=${seq}`;
  } catch {
    return sourceUrl;
  }
}

export function normalizeOpportunity(opportunity: Opportunity): Opportunity {
  return {
    ...opportunity,
    source_url: normalizeOpportunitySourceUrl(opportunity.source_url),
  };
}

export function getOpportunities(
  filters: OpportunityFilters = {},
  init?: ApiInit,
): Promise<Opportunity[]> {
  const p = new URLSearchParams();
  if (filters.type) p.set("type", filters.type);
  if (filters.org) p.set("org", filters.org);
  if (filters.deadline_after) p.set("deadline_after", filters.deadline_after);
  if (filters.limit) p.set("limit", String(filters.limit));
  const qs = p.toString();
  return apiGet<Opportunity[]>(
    `/opportunities${qs ? `?${qs}` : ""}`,
    init,
  ).then((items) => items.map(normalizeOpportunity));
}

/** GET /opportunities/matched — 프로필 벡터 기반 유사도 점수 포함 공고 목록 */
export function getMatchedOpportunities(
  userId: string,
  limit = 100,
  init?: ApiInit,
): Promise<Opportunity[]> {
  return apiGet<Opportunity[]>(
    `/opportunities/matched?user_id=${encodeURIComponent(userId)}&limit=${limit}`,
    init,
  ).then((items) => items.map(normalizeOpportunity));
}

export function getOpportunity(
  id: string,
  init?: ApiInit,
): Promise<Opportunity> {
  return apiGet<Opportunity>(`/opportunities/${id}`, init).then(
    normalizeOpportunity,
  );
}

// ===== 프로필 (profile) =====
export type Profile = {
  id: string;
  education?: string | null;
  major?: string | null;
  languages: string[];
  interests: string[];
  experience: string[];
  target_orgs: string[];
  target_region?: string | null;
};

export type ProfileUpdate = Partial<Omit<Profile, "id">>;

export function getProfile(userId: string, init?: ApiInit): Promise<Profile> {
  return apiGet<Profile>(
    `/profile?user_id=${encodeURIComponent(userId)}`,
    init,
  );
}

export function updateProfile(
  userId: string,
  data: ProfileUpdate,
): Promise<Profile> {
  return apiPut<{ user_id: string } & ProfileUpdate, Profile>("/profile", {
    user_id: userId,
    ...data,
  });
}

// ===== 챗봇 (chat) =====
export type ChatSource = {
  type: "opportunity" | "document";
  title?: string | null;
  category?: string | null;
  excerpt?: string | null;
  id?: string | null;
};

export type ChatResponse = {
  reply: string;
  sources: ChatSource[];
  session_id: string;
};

export function sendChat(
  message: string,
  userId: string,
  sessionId?: string,
  init?: ApiInit,
): Promise<ChatResponse> {
  return apiPost<
    { message: string; user_id: string; session_id?: string },
    ChatResponse
  >("/chat", { message, user_id: userId, session_id: sessionId }, init);
}

// ===== 개인화 추천 · 통계 (insight) =====
// 백엔드 개편: prefix /recommend → /insight (insight.py)
export type NewsArticle = {
  id: number;
  title: string;
  content?: string | null;
  summary?: string | null;
  source_url?: string | null;
  source_name?: string | null;
  source_api?: string | null;
  thumbnail_url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

export type OrgRatio = { name: string; count: number; percentage: number };
export type KeywordCount = { keyword: string; count: number };

export type UserStats =
  | { user_id: string; has_data: false; message: string }
  | {
      user_id: string;
      has_data: true;
      total_activities: number;
      organization_ratio: OrgRatio[];
      top_keywords: KeywordCount[];
    };

export function getUserStats(
  userId: string,
  init?: ApiInit,
): Promise<UserStats> {
  return apiGet<UserStats>(
    `/insight/stats/${encodeURIComponent(userId)}`,
    init,
  );
}

// ===== 개인화 공고 / 인사이트 (personalized) =====
// 백엔드 신규 엔드포인트. has_compass=false면 나침반 검사 전 상태.

/** 매칭 점수·추천 이유가 포함된 개인화 공고 아이템. match_score는 0~1. */
export type PersonalizedOpportunity = Opportunity & {
  match_score?: number | null;
  match_reasons?: string[];
};

export type PersonalizedOpportunities = {
  has_compass: boolean;
  items: PersonalizedOpportunity[];
  summary?: string;
};

/** GET /opportunities/personalized/{user_id} */
export function getPersonalizedOpportunities(
  userId: string,
  init?: ApiInit,
): Promise<PersonalizedOpportunities> {
  return apiGet<PersonalizedOpportunities>(
    `/opportunities/personalized/${encodeURIComponent(userId)}`,
    init,
  ).then((data) => ({
    ...data,
    items: data.items.map(normalizeOpportunity),
  }));
}

/** 매칭 점수·추천 이유가 포함된 개인화 뉴스 아이템. match_score는 0~1. */
export type PersonalizedInsightItem = NewsArticle & {
  match_score?: number | null;
  match_reasons?: string[];
};

export type PersonalizedInsights = {
  has_compass: boolean;
  items: PersonalizedInsightItem[];
  /** "개인화 인사이트" | "최신 인사이트" */
  type?: string;
  extracted_keywords?: string[];
  extracted_orgs?: string[];
};

/** GET /insight/personalized/{user_id} */
export function getPersonalizedInsights(
  userId: string,
  init?: ApiInit,
): Promise<PersonalizedInsights> {
  return apiGet<PersonalizedInsights>(
    `/insight/personalized/${encodeURIComponent(userId)}`,
    init,
  );
}

// ===== 활동 로깅 (insight/log) =====
// 개인화 추천의 입력 신호. 실패해도 UX를 막지 않도록 호출부에서 catch 무시 권장.

/** POST /insight/log/search — 검색 키워드 기록 */
export function logSearch(userId: string, keyword: string): Promise<unknown> {
  return apiPost<{ user_id: string; keyword: string }, unknown>(
    "/insight/log/search",
    { user_id: userId, keyword },
  );
}

/** POST /insight/log/click — 국제기구 클릭 기록 */
export function logClick(
  userId: string,
  targetOrganization: string,
): Promise<unknown> {
  return apiPost<{ user_id: string; target_organization: string }, unknown>(
    "/insight/log/click",
    {
      user_id: userId,
      target_organization: targetOrganization,
    },
  );
}
