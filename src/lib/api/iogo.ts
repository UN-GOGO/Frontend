// un-gogo 백엔드(FastAPI) 엔드포인트 호출 레이어.
// 계약은 backend/app/schemas.py · routers/*.py 와 1:1로 맞춘다.

import { apiGet, apiPost, apiPut } from "./client";

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
};

export type OpportunityFilters = {
  type?: string;
  org?: string;
  deadline_after?: string;
  limit?: number;
};

export function getOpportunities(
  filters: OpportunityFilters = {},
  init?: { signal?: AbortSignal },
): Promise<Opportunity[]> {
  const p = new URLSearchParams();
  if (filters.type) p.set("type", filters.type);
  if (filters.org) p.set("org", filters.org);
  if (filters.deadline_after) p.set("deadline_after", filters.deadline_after);
  if (filters.limit) p.set("limit", String(filters.limit));
  const qs = p.toString();
  return apiGet<Opportunity[]>(`/opportunities${qs ? `?${qs}` : ""}`, init);
}

export function getOpportunity(
  id: string,
  init?: { signal?: AbortSignal },
): Promise<Opportunity> {
  return apiGet<Opportunity>(`/opportunities/${id}`, init);
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

export function getProfile(
  userId: string,
  init?: { signal?: AbortSignal },
): Promise<Profile> {
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
  init?: { signal?: AbortSignal },
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
  init?: { signal?: AbortSignal },
): Promise<UserStats> {
  return apiGet<UserStats>(
    `/insight/stats/${encodeURIComponent(userId)}`,
    init,
  );
}

// ===== 개인화 공고 / 인사이트 (personalized) =====
// 백엔드 신규 엔드포인트. has_compass=false면 나침반 검사 전 상태.

/** 매칭 점수가 포함된 개인화 공고 아이템. score는 0~1. */
export type PersonalizedOpportunity = Opportunity & {
  match_score?: number | null;
};

export type PersonalizedOpportunities = {
  has_compass: boolean;
  items: PersonalizedOpportunity[];
};

/** GET /opportunities/personalized/{user_id} */
export function getPersonalizedOpportunities(
  userId: string,
  init?: { signal?: AbortSignal },
): Promise<PersonalizedOpportunities> {
  return apiGet<PersonalizedOpportunities>(
    `/opportunities/personalized/${encodeURIComponent(userId)}`,
    init,
  );
}

/** 매칭률·추천 이유가 포함된 개인화 뉴스 아이템. */
export type PersonalizedInsightItem = NewsArticle & {
  match_rate?: number | null;
  reason?: string | null;
};

export type PersonalizedInsights = {
  has_compass: boolean;
  items: PersonalizedInsightItem[];
};

/** GET /insight/personalized/{user_id} */
export function getPersonalizedInsights(
  userId: string,
  init?: { signal?: AbortSignal },
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
