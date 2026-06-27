-- 나침반(Compass) 추천 결과 저장 테이블
-- 흐름: 퀴즈 응답 → 백엔드 /recommend(Gemini Top3) → 결과를 이 테이블에 저장
-- 설계: 추천 1회 실행 = 1행(이력 누적), 결과는 jsonb 통째 저장, 입력 프로필 포함
-- 로그인 유저(users.id = auth.users.id)와 연결

create table if not exists public.navigator_results (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,

  -- 입력 (사용자가 보낸 진단 데이터)
  profile_input jsonb not null default '{}'::jsonb,  -- ProfileSummary: {nick, major, degree, exp, english, second}
  profile_text  text   not null,                     -- buildProfile()가 만든 백엔드 전송 텍스트
  answers       jsonb  not null default '[]'::jsonb,  -- 원본 퀴즈 답변 배열(Answer[])

  -- 결과 (백엔드 /recommend 응답)
  result_summary  text,                               -- 응답의 profile_summary(한 줄 요약)
  needle_label    text,                               -- "WHO 방향을 가리키고 있어요" 등
  advice          text,                               -- 마무리 조언
  recommendations jsonb not null default '[]'::jsonb, -- Top3 배열(Recommendation[])
  is_ai           boolean not null default false,     -- true=AI 추천, false=규칙기반 폴백

  created_at timestamp with time zone not null default now(),

  constraint navigator_results_pkey primary key (id),
  constraint navigator_results_user_id_fkey
    foreign key (user_id) references public.users (id) on delete cascade
);

-- 유저별 최신 이력 조회 최적화
create index if not exists navigator_results_user_id_created_at_idx
  on public.navigator_results (user_id, created_at desc);

-- RLS: 본인 행만 읽고/쓰기
alter table public.navigator_results enable row level security;

drop policy if exists "navigator_results_select_own" on public.navigator_results;
create policy "navigator_results_select_own"
  on public.navigator_results
  for select
  using (auth.uid() = user_id);

drop policy if exists "navigator_results_insert_own" on public.navigator_results;
create policy "navigator_results_insert_own"
  on public.navigator_results
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "navigator_results_delete_own" on public.navigator_results;
create policy "navigator_results_delete_own"
  on public.navigator_results
  for delete
  using (auth.uid() = user_id);
