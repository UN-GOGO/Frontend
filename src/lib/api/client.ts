import { createClient } from "@/lib/supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

// 백엔드가 응답 없이 오래 걸리는 경우(콜드 스타트·DB 지연 등) 화면이 무한 로딩으로
// 보이지 않도록 기본 타임아웃을 둔다. 호출자가 넘긴 signal과 함께 먼저 온 쪽이 이긴다.
// AI 추천처럼 원래 오래 걸리는 호출은 call site에서 timeoutMs로 넉넉히 늘려 써야
// "느리지만 성공"하는 응답이 타임아웃으로 조용히 실패 처리되지 않는다.
const DEFAULT_TIMEOUT_MS = 15000;

function withTimeout(signal?: AbortSignal, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
}

/**
 * fetch 실패 사유를 사람이 읽을 수 있는 메시지로 바꾼다(타임아웃 vs 취소 vs 그 외).
 * 타임아웃인 경우 `name`을 "TimeoutError"로 유지해, 호출자가 문자열 매칭 없이
 * `e.name === "TimeoutError"`로 "진짜 실패"와 구분할 수 있게 한다.
 */
function toFetchError(path: string, e: unknown): Error {
  if (e instanceof DOMException && e.name === "TimeoutError") {
    const err = new Error(`API ${path} 응답 지연 — 백엔드가 응답하지 않아요.`);
    err.name = "TimeoutError";
    return err;
  }
  if (e instanceof Error) return e;
  return new Error(String(e));
}

async function authHeader(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export type ApiInit = {
  signal?: AbortSignal;
  /** 이 호출만 기본 타임아웃(15s)과 다르게 주고 싶을 때(예: LLM 추천). */
  timeoutMs?: number;
};

async function request<TRes>(
  method: string,
  path: string,
  body?: unknown,
  init?: ApiInit,
): Promise<TRes> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(await authHeader()),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: withTimeout(init?.signal, init?.timeoutMs),
    });
    if (!res.ok) {
      throw new Error(`API ${path} 실패 (${res.status})`);
    }
    return (await res.json()) as TRes;
  } catch (e) {
    throw toFetchError(path, e);
  }
}

export function apiGet<TRes>(path: string, init?: ApiInit): Promise<TRes> {
  return request<TRes>("GET", path, undefined, init);
}

export function apiPost<TReq, TRes>(
  path: string,
  body: TReq,
  init?: ApiInit,
): Promise<TRes> {
  return request<TRes>("POST", path, body, init);
}

export function apiPut<TReq, TRes>(
  path: string,
  body: TReq,
  init?: ApiInit,
): Promise<TRes> {
  return request<TRes>("PUT", path, body, init);
}
