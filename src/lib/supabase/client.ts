import { createBrowserClient } from "@supabase/ssr";

// 실제 생성 로직은 제네릭이 아닌 별도 함수로 분리한다.
// `ReturnType<typeof createBrowserClient>`처럼 제네릭 함수 자체에 ReturnType을
// 걸면 Database 기본값(any)이 실제 호출 시점처럼 적용되지 않아 이후 .from().select()
// 결과가 전부 any로 새서 타입 에러가 났다. `createBrowserClient<any>`로 타입 인자를
// 명시하면 바로 고쳐지지만, 이 프로젝트는 @typescript-eslint/no-explicit-any를
// 에러로 강제하고 있어(코드베이스 전체에 any 사용 0건) 그 방법은 못 쓴다.
// 대신 비제네릭 래퍼 함수를 두면 이 함수의 ReturnType은 실제 호출처럼 정상
// 추론되므로, any 없이 동일한 효과를 낸다.
function createBrowserClientInstance() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

// 브라우저 클라이언트는 탭당 하나만 — 호출할 때마다 새로 만들면 내부 세션 캐시가
// 공유되지 않아, 여러 API를 동시에 부를 때(예: 마이페이지의 getProfile+getUserStats)
// 토큰 갱신(getSession)이 매번 따로 일어나 백엔드 응답이 체감상 느려진다.
let client: ReturnType<typeof createBrowserClientInstance> | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClientInstance();
  }
  return client;
}
