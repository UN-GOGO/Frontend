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

// ===== 개인화 추천 · 통계 (recommend) =====
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

export type RecommendResult = {
  user_id: string;
  type: string;
  extracted_keywords?: string[];
  extracted_orgs?: string[];
  recommended_articles: NewsArticle[];
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

export function getRecommendations(
  userId: string,
  init?: { signal?: AbortSignal },
): Promise<RecommendResult> {
  return apiGet<RecommendResult>(
    `/recommend/${encodeURIComponent(userId)}`,
    init,
  );
}

export function getUserStats(
  userId: string,
  init?: { signal?: AbortSignal },
): Promise<UserStats> {
  return apiGet<UserStats>(
    `/recommend/stats/${encodeURIComponent(userId)}`,
    init,
  );
}
